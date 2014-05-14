var data = {
    'domain' : '',
    'oauth': { secret: '', public:''},
    'analytics': '',
    'facebook': {'id': 1, secret:''},
    'googleapi': {id: '' },
    'soundcloud': {id:'', secret:''},
    'youtube': {id:'not needed?'},
};

/********** STOP CHANGING **************/
exports.data = data;
exports.safe = function(req, res) {
    //console.log("Sending safe");
    var safe = {}, tmp;
    for ( key in data) {
        if(typeof(data[key]) == 'object'){
            tmp = {};
            for ( prop in data[key]) {
                if(prop != 'secret') {
                    tmp[prop] = data[key][prop];
                }
            }
            safe[key] = tmp;
        } else {
            safe[key] = data[key];
        }
    }

    //res.set('Content-Type', 'application/x-javascript');
    res.send("angular.module('ammoApp.config',[]).constant('ammoConfig'," +
            JSON.stringify(safe)
            + ");");
    return safe;
};
