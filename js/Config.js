module.exports = {
    isTestNet: true,
    networkName: "kovan",
    // baseUrl: "http://localhost:3000",
    baseUrl: "https://digital-identity-app.herokuapp.com",
    identityRouterUrl: "https://identity-router.herokuapp.com",
    ipfsWriteUrl: "https://ipfs-node.eastus2.cloudapp.azure.com/save",
    ipfsFetchUrl: "https://ipfs-node.eastus2.cloudapp.azure.com/read",
    // ipfsFetchUrl: "https://ipfs.io/ipfs",
    ethProvider: 'http://localhost:8545',
    etherscanApiKey: 'D3PZWYNWARKN73MCVWFGX1QZ6EWMJE7J45',
    personaRegistryContract: 'contracts/PersonaRegistry',
    personaRegistryAddress: '0xd8fab77b7125de6d1a17dfacbdc0062837949a11',
    defaultGasPrice: 20000000000,
    defaultGasValue: 250000
}
