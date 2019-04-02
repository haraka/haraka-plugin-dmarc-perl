[![Build Status][ci-img]][ci-url]
[![Code Climate][clim-img]][clim-url]
[![Greenkeeper badge][gk-img]][gk-url]
[![NPM][npm-img]][npm-url]
<!-- requires URL update [![Windows Build Status][ci-win-img]][ci-win-url] -->

# haraka-plugin-dmarc-perl


## Install

Install Mail::DMARC somewhere and run the included `dmarc_httpd` CLI program. Configure dmarc-perl.ini to point at the Mail::DMARC HTTP service. Enable this plugin in haraka's config/plugins file.


## Enable Travis-CI testing

- [ ] visit your [Travis-CI profile page](https://travis-ci.org/profile) and enable Continuous Integration testing on the repo
- [ ] enable Code Climate. Click the _code climate_ badge and import your repo.


# Add your content here

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
[ci-img]: https://travis-ci.org/haraka/haraka-plugin-dmarc-perl.svg
[ci-url]: https://travis-ci.org/haraka/haraka-plugin-dmarc-perl
[ci-win-img]: https://ci.appveyor.com/api/projects/status/CHANGETHIS?svg=true
[ci-win-url]: https://ci.appveyor.com/project/haraka/haraka-CHANGETHIS
[clim-img]: https://codeclimate.com/github/haraka/haraka-plugin-dmarc-perl/badges/gpa.svg
[clim-url]: https://codeclimate.com/github/haraka/haraka-plugin-dmarc-perl
[gk-img]: https://badges.greenkeeper.io/haraka/haraka-plugin-dmarc-perl.svg
[gk-url]: https://greenkeeper.io/
[npm-img]: https://nodei.co/npm/haraka-plugin-dmarc-perl.png
[npm-url]: https://www.npmjs.com/package/haraka-plugin-dmarc-perl
