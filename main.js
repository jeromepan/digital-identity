var Web3Utility = require('./js/Web3Utility.js');
var Config = require('./js/Config.js');
var Buffer = Web3Utility.Buffer;
var async = require('async');
var CookieUtility = require("./js/CookieUtility.js");
var Crypto = require("./js/Crypto.js");


//** Globals ** //

var web3 = Web3Utility.initWeb3(window.web3);
var ipfs = Web3Utility.initIpfs();
var registryContract;
var userAccount;

//**  ** //

main();

function main() {
    initClickListeners();

    initUserInfo();

    loadData();
}

function initUserInfo() {
    if (userExists()) {
        userAccount = initUserAccount();
    } else {
        initNewAccount();
        showNewAccountPrompt(userAccount);
    }
    showUserAccountInfo(userAccount);
}

function loadData() {
    showUserAccountInfo(userAccount);

    async.waterfall([
        loadContract,
        fetchPersona,
        fetchIpfsFile
    ], function (error, result) {
        if (error) {
            showErrorState(error);
        } else {
            populateFormWithPersonaData(result);
        }
    });
}

function showErrorState(error) {

}

function userExists() {
    return CookieUtility.readCookie("account");
}

function initUserAccount() {
    return JSON.parse(CookieUtility.readCookie("account"));
}

function initNewAccount() {
    userAccount = Web3Utility.createAccount();
    CookieUtility.saveCookie("account", JSON.stringify(userAccount));
    showNewAccountPrompt(userAccount);
}

function showUserAccountInfo(account) {
    $('#user-address').text(account.address);
    $('#user-private-key').text(account.privateKey);
}

function loadContract(callback) {
    Web3Utility.loadContract(web3, Config.personaRegistryContract, Config.personaRegistryAddress,
        function(error, contract) {
        if (error) {
            console.log(error);
            callback(error, undefined);
        } else {
            registryContract = contract;
            callback(null, contract);
        }
    });
}

function fetchPersona(contract, callback) {
    Web3Utility.callContractFunction(web3, contract, Config.personaRegistryAddress, 'getIpfsPointer',
        [userAccount.address, userAccount.address], function(error, result) {
        if (error) {
            console.log(error);
            callback(error, undefined);
        } else {
            callback(undefined, result);
        }
    });
}

function fetchIpfsFile(ipfsPointer, callback) {
    if (!ipfsPointer) {
        callback(undefined, "{}");
    } else {
        ipfs.files.cat("/ipfs/" + ipfsPointer, function (error, stream) {
            if (error) {
                console.log(error);
                callback(error, undefined);
            } else {
                var fileParts = [];
                stream.on("data", function (part) {
                    fileParts.push(part.toString());
                });

                stream.on("end", function () {
                    var fileContents = "";
                    for (var i = 0; i < fileParts.length; i++) {
                        fileContents += fileParts[i];
                    }
                    var data = Crypto.decrypt(userAccount.privateKey, fileContents);
                    console.log(data);
                    callback(undefined, data);
                });
            }
        });
    }
}

function populateFormWithPersonaData(fileContents) {
    console.log(fileContents);
    try {
        var data = JSON.parse(fileContents);
        for (var field in data) {
            if (data.hasOwnProperty(field)) {
                $('input[name="' + field + '"]').val(data[field]);
            }
        }
    } catch(error) {
        console.log(error);
    }
}

function showNewAccountPrompt(account) {
    var message = "Here is your new Ethereum account: " + account.address +
        "<br /><br />Please BACKUP the private key for this account: " + account.privateKey +
        "<br /><br />and DO NOT share it with anybody. ";

    alertify.alert("New Keys Created", message);
}

function initClickListeners() {
    $('#create-button').click(function() {
        createPersona();
    });

    $('#private-key-toggle').click(function() {
        $('#user-private-key').show();
    });
}

function createPersona() {
    var fileContents = buildFileContents();

    var publicKey = Crypto.createPublicKey(userAccount.privateKey).toString();
    var encryptedData = Crypto.encrypt(publicKey, userAccount.privateKey, fileContents);
    saveIpfsFile(userAccount.address + "-" + userAccount.address + ".txt",
        encryptedData, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            var publicKey = Crypto.createPublicKey(userAccount.privateKey);
            var ipfsPointer = response[0].path;
            Web3Utility.send(web3, registryContract, Config.personaRegistryAddress, 'createPersona', [publicKey, ipfsPointer, {
                gas: 250000,
                value: 0
            }], userAccount.address, userAccount.privateKey, undefined, function (functionError, result) {
                if (functionError) {
                    console.log(functionError);
                } else {
                    console.log(result);
                }
            });
        }
    });
}

function buildFileContents() {
    var fields = ["name", "email", "city", "country"];

    var data = {};
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        data[field] = $('input[name="' + field + '"]').val();
    }

    return JSON.stringify(data);
}

function saveIpfsFile(name, data, callback) {
    var reader = new FileReader();
    reader.onloadend = function(event) {
        console.log(event.target.result);

        var buffer = Buffer.from(reader.result);
        ipfs.files.add(buffer, function(error, response) {
            if (error) {
                console.log(error);
                callback(error, undefined);
            } else {
                console.log(response);
                callback(undefined, response);
            }
        });
    };

    var file = new File([data], name, {
        type: "text/plain"
    });
    reader.readAsText(file);
}

