'use strict';

// DMARC for Haraka  (using Mail::DMARC HTTP service)

const http       = require('http');
// const Address    = require('address-rfc2821').Address;
const addrparser = require('address-rfc2822');

let host = '127.0.0.1';
let port = '8080';

exports.register = function () {
    this.load_dmarc_perl_ini();
}

exports.load_dmarc_perl_ini = function () {

    this.cfg = this.config.get('dmarc-perl.ini', {
        booleans: [
            '-main.reject',
        ],
    },
    () => {
        this.load_dmarc_perl_ini();
    });

    if (this.cfg.main.host) { host = this.cfg.main.host; }
    if (this.cfg.main.port) { port = this.cfg.main.port; }
}

function get_dkim_plugin_results (txn, body) {
    if (!txn.notes.dkim_results) return;

    for (const d of txn.notes.dkim_results) {
        if (!d.domain || !d.selector || !d.result) continue;
        body.dkim.push({
            domain:   d.domain,
            selector: d.selector,
            result:   d.result,
        });
    }
}

function get_spamassassin_dkim (txn, body) {

    if (!txn.notes.spamassassin) return;

    const sa_tests = txn.notes.spamassassin.tests;
    if (!sa_tests) return;

    if (!/DKIM_SIGNED/.test(sa_tests)) return;

    if (/DKIM_VALID_AU/.test(sa_tests)) {
        body.dkim.push({
            domain: (addrparser.parse(body.header_from_raw))[0].host(),
            selector: 'spamassassin',
            result: 'pass',
        });
    }
}

function get_rspamd_dkim (txn, body) {

    // check rspamd symbols
    const rspamd = txn.results.get('rspamd');
    if (rspamd && rspamd.symbols) {
        if (rspamd.symbols.R_DKIM_ALLOW !== undefined) {
            body.dkim.push({
                domain: (addrparser.parse(body.header_from_raw))[0].host(),
                selector: 'rspamd',
                result: 'pass',
            })
        }
        if (rspamd.symbols.R_DKIM_REJECT !== undefined) {
            body.dkim.push({
                domain: (addrparser.parse(body.header_from_raw))[0].host(),
                selector: 'rspamd',
                result: 'fail',
            })
        }
    }
}

function get_spf_results (connection, body) {

    const txn = connection.transaction;

    // SPF mfrom
    if (txn) {
        const mf_spf = txn.results.get('spf');
        if (mf_spf) body.spf.push({ scope: 'mfrom', result: mf_spf.result, domain: mf_spf.domain });
    }

    // SPF helo
    const h_spf = connection.results.get('spf');
    if (h_spf) body.spf.push({ scope: 'helo', result: h_spf.result, domain: h_spf.domain });
}

function get_rspamd_spf (txn, body) {

    if (body.spf.length) return;  // already got results

    // no results, check rspamd symbols
    const rspamd = txn.results.get('rspamd');
    if (rspamd && rspamd.symbols) {
        if (rspamd.symbols.R_SPF_ALLOW !== undefined) {
            body.spf.push({
                result: 'Pass', domain: txn.mail_from.host
            })
        }
        if (rspamd.symbols.R_SPF_FAIL !== undefined) {
            body.spf.push({ result: 'Fail', domain: txn.mail_from.host })
        }
    }
}

function get_spamassassin_spf (txn, body) {

    // no results yet
    if (body.spf.length) return;
    if (!txn.notes.spamassassin) return;

    const sa_tests = txn.notes.spamassassin.tests;
    if (!sa_tests) return;

    if (/SPF_PASS/.test(sa_tests)) {
        body.spf.push({ result: 'Pass', domain: txn.mail_from.host })
    }
    if (/SPF_FAIL/.test(sa_tests)) {
        body.spf.push({ result: 'Fail', domain: txn.mail_from.host })
    }
}

exports.assemble_HTTP_POST = function (connection) {

    return new Promise((resolve, reject) => {
        const txn = connection.transaction;
        const body = {
            source_ip:       connection.remote.ip,
            envelope_to:     txn.rcpt_to[0].host,
            envelope_from:   txn.mail_from.host,
            header_from_raw: txn.header.get_decoded('From'),
            dkim:            [],
            spf : [
                /* { domain => 'example.com', scope => 'mfrom', result => 'pass' } */
            ],
        };

        // populate DKIM results from...
        get_dkim_plugin_results(txn, body);
        get_rspamd_dkim(txn, body);
        get_spamassassin_dkim(txn, body);

        // populate SPF results from...
        get_spf_results(connection, body);  // SPF plugin
        get_rspamd_spf(txn, body);          // rspamd
        get_spamassassin_spf(txn, body);    // Spamassassin

        resolve(JSON.stringify(body));
    })
}

function get_http_opts (md_string) {
    return new Promise(resolve => {
        resolve({
            host,
            port,
            method: 'POST',
            path: '/dmarc/json/validate',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': Buffer.byteLength(md_string),
            }
        })
    })
}

exports.getJSON = function (postData) {

    return new Promise((resolve, reject) => {

        get_http_opts(postData).then(httpOpts => {

            const req = http.request(httpOpts, (res) => {

                if (res.statusCode !== 200) {
                    reject(new Error(`Not 200 result code: ${res.statusCode}`));
                    return;
                }

                res.setEncoding('utf8');
                let responseStr = '';

                res.on('data', (chunk) => { responseStr += chunk; })

                res.on('end', () => {

                    try {
                        const resObj = JSON.parse(responseStr);
                        resolve(resObj);
                    }
                    catch (e) {
                        reject(new Error(`error parsing JSON: ${e}`));
                    }
                })
            })

            req.on('error', e => { reject(e) })

            req.write(postData)
            req.end();

        }).catch(reject);
    })
}

exports.hook_data_post = function (next, connection) {
    const plugin = this;

    plugin.assemble_HTTP_POST(connection)
        .then(plugin.getJSON)
        .then(dmarc => {

            if (!connection.transaction) return next();

            let auth_pub = '';
            if (dmarc.published) {
                auth_pub = `(p=${dmarc.published.p} d=${dmarc.published.domain})`;
            }

            connection.transaction.results.add(plugin, {
                dmarc:       dmarc.result,
                disposition: dmarc.disposition,
            });
            if (dmarc.dkim) {
                connection.transaction.results.add(plugin, { dkim: dmarc.dkim });
            }
            if (dmarc.spf) {
                connection.transaction.results.add(plugin, { spf: dmarc.spf });
            }

            if (dmarc.result === 'pass') {
                connection.transaction.results.add(plugin, { pass: auth_pub, emit: true });
                connection.auth_results(`dmarc=pass ${auth_pub}`);
            }
            else {
                if (dmarc.published) {      // DMARC alignment failed
                    connection.transaction.results.add(plugin, { fail: auth_pub, emit: true });
                    connection.auth_results(`dmarc=fail ${auth_pub}`);
                }
                if (dmarc.reason) {
                    for (const reason of dmarc.reason) {
                        connection.transaction.results.add(plugin, { msg: `${reason.type}:${reason.comment}`, emit: true });
                    }
                }
            }

            next();
        })
        .catch(e => {
            if (connection.transaction) {
                connection.transaction.results.add(plugin, {err: e.message});
            }
            connection.logerror(plugin, `error: ${e.message}`);
            next();
        })
}
