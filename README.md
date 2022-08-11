[![Build Status][ci-img]][ci-url]
[![Windows Build Status][ci-win-img]][ci-win-url]
[![Code Climate][clim-img]][clim-url]

[![NPM][npm-img]][npm-url]

# haraka-plugin-dmarc-perl

## SYNOPSIS

- Install Mail::DMARC somewhere. [Example](https://github.com/msimerson/Mail-Toaster-6/blob/master/provision/mail_dmarc.sh)
- Run the included `dmarc_httpd` CLI program.
- Configure dmarc-perl.ini to point at the Mail::DMARC HTTP service.
- Enable this plugin in haraka's config/plugins file.

## INSTALL

```sh
cd /path/to/local/haraka
npm install haraka-plugin-dmarc-perl
echo "dmarc-perl" >> config/plugins
service haraka restart
```

### Configuration

If the default configuration is not sufficient, copy the config file from the distribution into your haraka config dir and then modify it:

```sh
cp node_modules/haraka-plugin-dmarc-perl/config/dmarc-perl.ini config/dmarc-perl.ini
$EDITOR config/dmarc-perl.ini
```

## USAGE


<!-- leave these buried at the bottom of the document -->
[ci-img]: https://github.com/haraka/haraka-plugin-dmarc-perl/workflows/Plugin%20Tests/badge.svg
[ci-url]: https://github.com/haraka/haraka-plugin-dmarc-perl/actions?query=workflow%3A%22Plugin+Tests%22
[ci-win-img]: https://github.com/haraka/haraka-plugin-dmarc-perl/workflows/Tests%20-%20Windows/badge.svg
[ci-win-url]: https://github.com/haraka/haraka-plugin-dmarc-perl/actions?query=workflow%3A%22Tests+-+Windows%22
[clim-img]: https://codeclimate.com/github/haraka/haraka-plugin-dmarc-perl/badges/gpa.svg
[clim-url]: https://codeclimate.com/github/haraka/haraka-plugin-dmarc-perl
[npm-img]: https://nodei.co/npm/haraka-plugin-dmarc-perl.png
[npm-url]: https://www.npmjs.com/package/haraka-plugin-dmarc-perl
