const jiraTools = require('../app/jiraTools');
const auth = require('../config/auth').jiraAuth;
const issuesGetAPIUri = "/rest/api/2/issue/{id}";
const issueCreateAPIUri = "/rest/api/2/issue";
const issuesSearchAPIUri = "/rest/api/2/search";
const createmetaAPIUri = "/rest/api/2/issue/createmeta";
const myselfAPIUri = "/rest/api/2/myself";
const methodGet = "GET";
const createmetaParams = {
    parameters: {
        expand: "projects.issuetypes.fields",
        projectKeys: "SA"
    },
    headers: {"Accept": "application/json", "Content-Type": "application/json"}
};
const myselfParams = {
    headers: {"Accept": "application/json", "Content-Type": "application/json"}
};

module.exports.createIssue = function (jiraUserId, issue) {
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId)
            .then((credentials) => resolve(credentials))
            .catch(reject);
    }).then(function (credentials) {
        const url = auth.base_url + issueCreateAPIUri;
        let args = {
            data: issue,
            path: {"id": issueKey},
            parameters: {},
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };
        return jiraTools.invoke(credentials.token, methodGet, url, args);
    }).then((data) => {
        return data;
    });
};

module.exports.getIssue = function (jiraUserId, issueKey) {
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId)
            .then((credentials) => resolve(credentials))
            .catch(reject);
    }).then(function (credentials) {
        const url = auth.base_url + issuesGetAPIUri;
        let args = {
            data: {},
            path: {"id": issueKey},
            parameters: {},
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };
        return jiraTools.invoke(credentials.token, methodGet, url, args);
    }).then((data) => {
        return data;
    });
};


module.exports.issueSearch = function (jiraUserId, text) {
    let textTrimed = text.trim();
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId)
            .then((credentials) => resolve(credentials))
            .catch(reject);
    }).then(function (credentials) {
        const url = auth.base_url + issuesSearchAPIUri;
        let jql = "text ~ '" + textTrimed + "'";
        let args = {
            parameters: {"jql": jql},
            headers: {
                "Accept": "application/json"
            }
        };
        return Promise.all([jiraTools.invoke(credentials.token, methodGet, url, args), credentials]);
    }).then(([data, credentials]) => {
        if (data.issues.length === 0) {
            const url = auth.base_url + issuesSearchAPIUri;
            let jql = "id = '" + textTrimed + "'";
            let args = {
                parameters: {"jql": jql},
                headers: {
                    "Accept": "application/json"
                }
            };
            return jiraTools.invoke(credentials.token, methodGet, url, args)
        } else {
            return data;
        }
    }).then((data) => {
        return data.issues.map(function (issue) {
            return {
                key: issue.key, summary: issue.fields.summary
            };
        });
    });
};

module.exports.getCreatemeta = function (jiraUserId) {
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId)
            .then((credentials) => resolve(credentials))
            .catch(reject);
    }).then(function (credentials) {
        const url = auth.base_url + createmetaAPIUri;
        return jiraTools.invoke(credentials.token, methodGet, url, createmetaParams)
    }).then((data) => {
        return data.projects[0];
    });

};

module.exports.getMyself = function (jiraUserId) {
    return new Promise(function (resolve, reject) {
        jiraTools.getCredentials(jiraUserId)
            .then((credentials) => resolve(credentials))
            .catch(reject);
    }).then(function (credentials) {
        const url = auth.base_url + myselfAPIUri;
        return jiraTools.invoke(credentials.token, methodGet, url, myselfParams)
    }).then((data) => {
        return data;
    });
};

module.exports.createIssueTypesCombo = function (jiraMeta) {
    const result = [];
    jiraMeta.issuetypes.forEach(function (item) {
        result.push({
            text: item.name,
            value: item.id,
            selected: false,
            description: item.description,
            imageSrc: item.iconUrl
        });
    });
    return result;
};

module.exports.createPriorityCombo = function (jiraMeta) {
    const result = [];
    jiraMeta.issuetypes[0].fields.priority.allowedValues.forEach(function (item) {
        result.push({
            text: item.name,
            value: item.id,
            selected: false,
            imageSrc: item.iconUrl
        });
    });
    return result;
};
