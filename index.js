'use strict';

exports.register = function () {
    const plugin = this;
    plugin.load_dmarc-perl_ini();
}

exports.load_dmarc-perl_ini = function () {
    const plugin = this;

    plugin.cfg = plugin.config.get('dmarc-perl.ini', {
        booleans: [
            '+enabled',               // plugins.cfg.main.enabled=true
            '-disabled',              // plugins.cfg.main.disabled=false
            '+feature_section.yes'    // plugins.cfg.feature_section.yes=true
        ]
    },
    function () {
        plugin.load_example_ini();
    });
}
