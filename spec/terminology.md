## Terminology

These terms are defined by this specification:
[[def: subject]]
~ A subject, also known as an identity subject, is the entity that a digital identity belongs to.  

[[def: claim]]
~ A claim is a part of digital identity related to a [[ref: subject]]. A claim can be attested by the identity subject itself, or it can be asserted by another entity. 

[[def: credential]]
~ A credential is a set of [[ref: claim]]s about an identity [[ref: subject]]. A verifiable credential is a tamper-proof credential whose authorship is cryptographically verifiable. An anonymous credential is a verifiable credential that has privacy-preserving properties to enable data minimization and correlation resistance. 

[[def: issuer]]
~ An issuer is one of the three entities that interact with each other within the domain of digital identities. It can assert [[ref: claim]]s about a [[ref: subject]] in the form of a tamper-proof credential whose origins are cryptographically verifiable. 

[[def: verifier]]

~ A verifier is an entity that validates identity information from a [[ref: holder]] to grant access to goods and services.

[[def: holder]]
~ A holder, also known as an identity holder, is the entity that is in possession of the [[ref: credential]]s. In most use cases, the holder is also the identity [[ref: subject]]. A holder can interact with an issuer to obtain anonymous credentials. It can also create derived information from anonymous credentials that can be presented to a [[ref: verifier]] to gain access to goods and services.

[[def: SCHEMA]]

~ A SCHEMA object is a template that defines a set of attribute(names) which are going to be used by [[ref: issuer]]s for issuance of [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) within a Hyperledger Indy network. SCHEMAs have a name, version and can be [written](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/transactions.html#schema) to the ledger by any entity with proper permissions. SCHEMAs can be [read](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/requests.html#get-schema)from a Hyperledger Indy Node by any client.

~ SCHEMAs define the list of attribute(names) of issued credentials based on a [[ref: CRED_DEF]] (see below).

[[def: CRED_DEF]]
~ A CRED_DEF (short for "credential definition", also known as CLAIM_DEF) object ontains data required for credential issuance as well as
credential validation and can be [read](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/requests.html#get-claim-def) by any Hyperledger Indy client. A CRED_DEF object references a [[ref: SCHEMA]], references a DID of the [[ref: issuer]] and can be [written](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/requests.html#claim-def) by any [[ref: issuer]] who intends to issue credentials based on that specific [[ref: SCHEMA]] to the ledger and has the proper permissions in doing so. A [[ref: SCHEMA]] is in a 1:n relation with CRED_DEF, meaning there can be many CRED_DEFs related to a SCHEMA while a CRED_DEF can only derive from one [[ref: SCHEMA]]. A CRED_DEF must be accessible to all credential participants, issuers, holders, and verifiers. CRED_DEFs are public data structures that are stored in an indy ledger. A public key of the [[ref: issuer]] is included within the CRED_DEF which allows validation of the credentials signed by the issuer's private key. When credentials are issued by using the issuers CRED_DEF, the attribute(names) of the [[ref: SCHEMA]] have to be used.

~ A private_CRED_DEF is an object stored with the [[ref: issuer]] that contains the private keys and the attributes related to a CRED_DEF. These private keys are used to create signature proofs for the issued anonymous credentials, which then can be validated in a derived form by a [[ref: verifier]]. A private_CRED_DEF never leaves the [[ref: Issuer]]'s domain and are stored securely.

~ Revokable Verifiable Credentials require CRED_DEFs which also reference a [[ref: REV_REG_DEF]] (see below).

[[def: REV_REG_DEF]]
~ A REV_REG_DEF object (short for "revocation registry definition") contains information required for [[ref: verifier]]s in order to enable them to verify whether a (revokable) verifiable credential has been revoked by the issuer since issuance.

~ REV_REG_DEFs are only needed for revokable verifiable credentials and are most commonly [written](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/requests.html#claim-def) to the ledger by the owner of a [[ref: CRED_DEF]] immediatly after the [[ref: CRED_DEF]] has been written. They can be [read](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/requests.html#get-attrib) from a Hyperledger Indy Node by any client and are updated in case of the revocation of a credential, which is based on the used [[ref: CLAIM_DEF]].

~ Further details about Hyperledger Indy's revocation process can be found [here](https://hyperledger-indy.readthedocs.io/projects/hipe/en/latest/text/0011-cred-revocation/README.html).


[[def: REV_REG_ENTRY]]
~ A REV_REG_ENTRY object (short for "revocation registry entry") marks the current status of one or more revokable verifiable credentials ("revoked" or "not revoked") in the ledger in a privacy preserving manner. A REV_REG_ENTRY is [written](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/requests.html#revoc-reg-entry) by the owner of a REV_REG_DEF respectively the issuer of the credential(s) based on a [[ref: CRED_DEF]] and its REV_REG_DEF.

~ Any REV_REG_ENTRY condensed with further required information can be [read](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/requests.html#get-revoc-reg-delta) by any Hyperledger Indy client.

~ Further details about Hyperledger Indy's revocation process can be found [here](https://hyperledger-indy.readthedocs.io/projects/hipe/en/latest/text/0011-cred-revocation/README.html).


Finalize glossary entries

**Question**: Should the items that are AnonCreds data models be included in this?
:::
