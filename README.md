[![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg?style=plastic)](https://github.com/conventional-changelog/standard-version)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://github.com/tbaltrushaitis/cmdb-rtm/blob/master/LICENSE.md)
[![Dependency Status](https://david-dm.org/tbaltrushaitis/cmdb-rtm.svg?theme=shields.io)](https://david-dm.org/tbaltrushaitis/cmdb-rtm)
[![devDependency Status](https://david-dm.org/tbaltrushaitis/cmdb-rtm/dev-status.svg?theme=shields.io)](https://david-dm.org/tbaltrushaitis/cmdb-rtm#info=devDependencies)

# CMDB-rtm #

Real-time Tasks Progress Visualization

![Real Time Jobs Progress View](assets/img/cmdb-rtm-poc-4-windows.gif)

`cmdb` `real-time` `monitoring` `data visualization`

---

## Live Demo ##
Try to open this [link](http://bit.ly/cmdb-rtm) :point_left: in **several tabs** of your current browser or

 - [ ] better - do it in **different browsers**
 - [x] best - use **different devices** to try from

All data about status will be shown as HTML elements with some (or any) animations run on all devices `simultaneously`

---

## Getting started ##

Its simple. Get it done in the way like this piece of shi*, sorry, of course pieces of code below:

Just `clone` and `make`:

```shell
 $ REPO="cmdb-rtm" \
&& git clone "https://github.com/tbaltrushaitis/${REPO}" \
&& cd ${REPO} \
&& make ;
```

then `start` as service:

```shell
 $ REPO="cmdb-rtm" \
&& cd ${REPO} \
&& npm start ;
```

 - [x] It might looks like:

![Run Application Server](assets/img/npm-start-001.png)

Then navigate your agent to `http://your-local.domain:8084/`

 - [x] You should see visualized rtm-data:

![Real Time Jobs Progress View](assets/img/cmdb-rtm-progress.gif)

 - [x] Check output of server console:

![Run Application Server](assets/img/user-connected-001.png)

---

## Credits ##

 Scope | Role | Name | Version | Description
:-----:|:----:|:-----|:-------:|:------------
 Front | Library | [animate.css](http://daneden.github.io/animate.css/) | 3.7.0 | A cross-browser library of CSS animations
 Front | Framework | [Bootstrap](http://getbootstrap.com) | 3.3.7 | HTML, CSS, and JS framework
 Front | Library | [jQuery](http://jquery.com/) | 3.3.1 | JavaScript Library
 Front | Library | [Lodash](https://lodash.com/docs/4.17.11) | 4.17.11 | A modern JavaScript utility library delivering modularity, performance & extras.

---

## Todo List ##

 - [ ] Implement business logic within a real ES6 Class instances
 - [ ] ~~Create repository~~ (Done v0.0.0)

See the [Changelog][Changelog] for the history of project changes and improvements.

---

This product is [MIT Licensed][License]

---

### More Info ###

 - [GitHub / Basic writing and formatting syntax](https://help.github.com/articles/basic-writing-and-formatting-syntax/)
 - [BitBucket Markdown Howto](https://bitbucket.org/tutorials/markdowndemo)
 - [Creating an Automated Build](https://docs.docker.com/docker-hub/builds/)
 - [Linking containers](https://docs.docker.com/engine/userguide/networking/default_network/dockerlinks.md)
 - [Cross-host linking containers](https://docs.docker.com/engine/admin/ambassador_pattern_linking.md)
 - [Linking containers](https://docs.docker.com/engine/userguide/networking/default_network/dockerlinks.md)

---

> Developed in **November 2016**

:scorpius:

[Changelog]: CHANGELOG.md
[License]: LICENSE.md
