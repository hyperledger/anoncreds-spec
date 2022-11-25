## Security Considerations

### Cryptography

#### Signature
::: todo
Add security considerations related to CL signatures
::: 

#### Revocation / Accumulators
::: todo
Add security considerations related to cryptographic accumulators and AnonCreds revocation
- issues with too small revocation registries
- ...
:::

### Verifiable Data Registry
It is recommended to use a [[ref: Verifiable Data Registry]] that complies with the state of the art security features and best practices.

#### Permission Management
The VDR for storing [[ref: SCHEMA]]s, [[ref: Credential Definition]]s, [[ref: Revocation Registry Definition]]s, and [[ref: Revocation Registry Entry]]s shall ensure that only the owner or from the owner permitted entities can write, edit, or revoke those AnonCreds objects. Furthermore, public AnonCreds objects shall be readable by any entity that can access the VDR.

#### Authentication of Issuer
The VDR shall allow only permitted entities to issue AnonCreds based on AnonCreds objects related to it.  

#### Security Requirements at DIDs and Related Keys
It is recommended to follow the best practices of decentralized key management system designs and architectures. For example, an option for publishing AnonCreds is the Hyperledger Indy, which are built on the following [DKMS Design and Architecture](https://github.com/hyperledger/indy-sdk/blob/main/docs/design/005-dkms/DKMS%20Design%20and%20Architecture%20V3.md) 

### Envelope
AnonCreds should be packed in a message envelope that can fulfill properties such as authenticity, integrity, confidentiality, and non-repudiation of the message. A message can have these properties with signature and encryption algorithms. It is recommended to choose signature and encryption algorithms that are state of the art and offer such security. For example, Hyperledger Indy utilizes DIDComm v1 as message envelope for exchanging AnonCreds between [[ref: issuer]]s, [[ref: holder]]s, and [[ref: verifier]]s. 

### Transport
This specification does not mention which transport protocols should be used to exchange AnonCreds between parties. It is recommended to use transport protocols that are state of the art and offer such security.


### Wallet
It is recommended to follow the wallet security best practices such as the one created by the [DIF Wallet Security Working Group] (https://github.com/decentralized-identity/wallet-security)

#### Recovery
The wallets for AnonCreds shall offer recovery mechanisms for the [[ref: holder]]s to export their keys and/or [[ref: link secret]]s to different devices. Furthermore, wallet applications should offer portability mechanisms for [[ref: holder]]s to migrate their credentials from one wallet (or end device) to another. 

#### Support of Hardware Secure Modules
The current underlying signature algorithm of AnonCreds is currently not supported by any hardware secure module. Use cases requiring binding of an AnonCreds to a device (device binding) can follow the best practices of wallet security (hyperlink) until the AnonCreds signature algorithm is supported by hardware secure modules of enduser devices.  

### Crypto Agility
The underlying signature algorithm of AnonCreds is not known to be a post-quantum computing resistant. As new signature algorithms evolve for the post-quantum computing security, the underlying signature algorithm of AnonCreds shall keep privacy-preserving features such as selective disclosure and non-correlatability.

