module.exports = {
    isTestNet: true,
    networkName: "kovan",
    baseUrl: "http://localhost:3000",
    // baseUrl: "https://digital-identity-app.herokuapp.com",
    identityRouterUrl: "https://identity-router.herokuapp.com",
    ipfsNodeUrl: "http://ipfs-node.eastus2.cloudapp.azure.com:5002",
    ethProvider: 'http://localhost:8545',
    etherscanApiKey: 'D3PZWYNWARKN73MCVWFGX1QZ6EWMJE7J45',
    personaRegistryContract: 'contracts/PersonaRegistry',
    personaRegistryAddress: '0xd8fab77b7125de6d1a17dfacbdc0062837949a11',
    defaultGasPrice: 20000000000,
}
