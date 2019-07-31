/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    const docsUrl = this.props.config.docsUrl;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    return `${baseUrl}${docsPart}${langPart}${doc}`;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? `${language}/` : '') + doc;
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('geyser.html', this.props.language)}>
              Docs Home
            </a>
            <a href={this.docUrl('getting-started.html', this.props.language)}>
              Getting Started
            </a>
            <a href={this.docUrl('plugin-api.html', this.props.language)}>
              Plugin API Reference
            </a>
          </div>
          <div>
            <h5>Links</h5>
            <a
              href="https://bstats.org/plugin/server-implementation/Geyser"
              target="_blank"
              rel="noreferrer noopener">
              Statistics
            </a>
            <a
              href="https://github.com/GeyserMC"
              target="_blank"
              rel="noreferrer noopener">
              GitHub
            </a>
            <a href="https://discord.gg/mRjbCsS">Discord</a>
            <a href={`${this.props.config.baseUrl}blog`}>Blog</a>
          </div>
          <div>
            <h5>Project Info</h5>
            <img alt ="Stars" src="https://img.shields.io/github/stars/GeyserMC/Geyser?color=yellow&style=plastic">
            <img alt ="Issues" src="https://img.shields.io/github/issues/GeyserMC/Geyser?color=red&style=plastic">
            <img alt ="Pull Requests" src="https://img.shields.io/github/issues-pr/GeyserMC/Geyser?color=purple&style=plastic">
            <img alt ="Forks" src="https://img.shields.io/github/forks/GeyserMC/Geyser">
            <img alt ="Last Commit" src="https://img.shields.io/github/last-commit/GeyserMC/Geyser?color=green&style=plastic">
            <img alt="License" src="https://img.shields.io/github/license/GeyserMC/Geyser?color=magenta&style=plastic">
          </div>
        </section>
        <a
          href="https://github.com/GeyserMC/"
          target="_blank"
          rel="noreferrer noopener"
          className="fbOpenSource">
          <img
            src={`${this.props.config.baseUrl}img/oss_logo.png`}
            alt="GeyserMC"
            width="170"
            height="45"
          />
        </a>
        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    );
  }
}

module.exports = Footer;
