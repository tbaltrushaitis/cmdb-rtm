<p align="center">
  <a href="https://github.com/conventional-changelog/standard-version"><img src="https://img.shields.io/badge/release-standard%20version-brightgreen.svg?style=plastic" alt="Standard Version"></a>
  <a href="https://github.com/tbaltrushaitis/cmdb-rtm/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat" alt="License"></a>
  <a href="https://github.com/tbaltrushaitis/cmdb-rtm/releases"><img src="https://img.shields.io/github/release/tbaltrushaitis/cmdb-rtm.svg?style=flat" alt="GitHub release"></a>
</p>

<p align="center">
  <h2 align="center">Real-time Tasks Progress Visualization</h2>
</p>

<p align="center">
  <a href="http://bit.ly/cmdb-rtm-live?ref=readme">
    <img src="assets/img/cmdb-rtm-poc-4-windows.gif" max-width="720px" max-height="571px" alt="Real Time Jobs Progress View" />
  </a>
</p>

`cmdb` `real-time` `monitoring` `data visualization`

---

## Live Demo ##
Try to open this [page](http://bit.ly/cmdb-rtm-live) :point_left: in:

- :zero::zero: - **several tabs** of your current browser
 or
- :zero::five: - do it in **several different browsers**
 or
- :five::zero: - use **several different devices** to try from

All data about tasks progress status will be shown as HTML elements with various
(if there are any) animations. Live page can be viewed `simultaneously` on any
device and all instances should look same.

---

## Getting started ##

Its simple. Get it done in the way like this piece of shi*, sorry, of course pieces of code below:

Simply clone the repository and then run `make` inside of a cloned directory:

```shell
$  REPO="cmdb-rtm" \
&& git clone "https://github.com/tbaltrushaitis/${REPO}" \
&& cd ${REPO} \
&& make ;
```

then `start` as a service:

```shell
$ npm start
```

- [x] It might looks like:

![Run Application Server](assets/img/npm-start-001.png)

Then navigate your agent to :point_right: `http://localhost:8084/`

- [x] Tasks queue data should be **visible** and **animated**:

![Real Time Jobs Progress View](assets/img/cmdb-rtm-progress.gif)

- [x] Check output of server console:

![Run Application Server](assets/img/user-connected-001.png)

---

## Credits ##

 Scope | Role | Name | Version | Description
:-----:|:----:|:-----|:-------:|:------------
 Front | Library | [animate.css](http://daneden.github.io/animate.css/) | [4.1.1](https://github.com/daneden/animate.css/tree/v4.1.1) | A cross-browser library of CSS animations
 Front | Framework | [Bootstrap](http://getbootstrap.com) | [3.4.1](https://getbootstrap.com/docs/3.4/) | HTML, CSS, and JS framework
 Front | Library | [jQuery](http://jquery.com/) | [3.5.1](https://github.com/jquery/jquery/tree/3.5.1) | JavaScript Library
 Front | Library | [Lodash](https://lodash.com/) | [4.17.21](https://lodash.com/docs/4.17.21) | A modern JavaScript utility library delivering modularity, performance & extras.

---

## TODO List ##

- [ ] Implement business logic within a real ES6 Class instances
- [x] ~~Create repository~~ (Done v0.0.0)

See the [Changelog][Changelog] for the history of the project changes and improvements.

---

This product is [MIT Licensed][License]

---

### More Info ###

 - [GitHub / Basic writing and formatting syntax](https://help.github.com/articles/basic-writing-and-formatting-syntax/)
 - [BitBucket Markdown Howto](https://bitbucket.org/tutorials/markdowndemo)
 - [Creating an Automated Build](https://docs.docker.com/docker-hub/builds/)

---

> Developed in **November 2016**

:scorpion:

[Changelog]: CHANGELOG.md
[License]: LICENSE.md
