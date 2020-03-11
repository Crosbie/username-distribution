# username-distribution app

This web app distributes usernames and passwords to individuals who are taking part in an Openshift based workshop. Deploying this app in Openshift and exposing it publicly will give users a central access point, giving them their individual login credentials and links to lab guides.

![screenshot](screen.png)

## How to Use

To make use of this app, just edit the config.json file and deploy in Openshift. See below config values and descriptions

| name | default | description |
| ---- | ------- | ----------- |
| eventTitle | "OCP4 Workshop" | This title will be displayed at the top of the page |
| eventHours | 8 | The length of the event in hours, this will determine how long the login cookies live for |
| accounts.number | 100 | The number of available user logins |
| accounts.password | "openshift" | The default password for all users |
| accounts.blockedUsers | [9,10] | Choose to reserve some user accounts, these numbers will not be assigned |
| accounts.prefix | "user" | The username prefix for each account (eg. {prefix}1, {prefix}2) |
| modules.module1 | null | URL of the first lab guide, null if not used |
| modules.module2 | "http://dummy.com" | URL of the second lab guide, null if not used |
| modules.module3 | "http://dummy.com" | URL of the third lab guide, null if not used |
| modules.module4 | null | URL of the fourth lab guide, null if not used |
