
// node.js built-in modules
const assert   = require('assert');

// npm modules
const fixtures = require('haraka-test-fixtures');
const ResultStore = require('haraka-results')

const Address  = require('address-rfc2821').Address;

beforeEach(function (done) {
    this.plugin = new fixtures.plugin('dmarc-perl');
    // console.log(this.plugin.config);
    done();  // if a test hangs, assure you called done()
})

describe('dmarc-perl', () => {
    it('loads', function (done) {
        assert.ok(this.plugin);
        done();
    })
})

describe('load_dmarc_perl_ini', () => {
    it('loads dmarc-perl.ini from config/dmarc-perl.ini', function (done) {
        this.plugin.load_dmarc_perl_ini();
        assert.ok(this.plugin.cfg);
        done();
    })

    it('initializes port', function (done) {
        this.plugin.load_dmarc_perl_ini();
        assert.equal(this.plugin.cfg.main.port, '8080', this.plugin.cfg);
        done();
    })
})

function getConnection () {
    const conn = fixtures.connection.createConnection();
    conn.transaction = fixtures.transaction.createTransaction();
    conn.remote = { ip: '1.2.3.4' }
    conn.transaction.rcpt_to.push(new Address('recipient@example.com'));
    conn.transaction.mail_from = new Address('sender@example.com');
    conn.transaction.header.add('From', 'Mock Sender <sender@example.com')
    conn.transaction.results = new ResultStore(conn.transaction);
    return conn;
}

describe('assemble_HTTP_POST', () => {
    const expected = {"source_ip":"1.2.3.4","envelope_to":"example.com","envelope_from":"example.com","header_from_raw":"Mock Sender <sender@example.com","dkim":[],"spf":[]};

    before(function (done) {
        this.connection = getConnection()
        done();
    })

    it('assembles Mail::DMARC request from Haraka connection', function (done) {
        this.plugin.assemble_HTTP_POST(this.connection).then((req) => {
            assert.deepEqual(JSON.parse(req), expected);
            // console.log(r);
            done();
        }).catch(done);
    })
})

describe('get_http_opts', function () {

    const expected = {
        host: '127.0.0.1',
        port: '8080',
        method: 'POST',
        path: '/dmarc/json/validate',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': 152
        }
    }

    before(function (done) {
        this.connection = getConnection()
        done();
    })

    it('returns a HTTP request object', function (done) {
        this.plugin.assemble_HTTP_POST(this.connection).then(this.plugin.get_http_opts).then((r) => {
            assert.deepEqual(r, expected);
            done();
        }).catch(done)
    })
})
