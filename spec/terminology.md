## Terminology

[[def: claim, claims]]
~ A claim is a part of digital identity related to a [[ref: subject]]. A claim can be attested by the identity subject itself, or it can be asserted by another entity. 

[[def: Correctness Proof]]
~ TODO
::: todo
Describe (key) Correctness Proof
:::

[[def: credential, credentials]]
~ A credential is a set of [[ref: claims]] about an identity [[ref: subject]]. A verifiable credential is a tamper-proof credential whose authorship is cryptographically verifiable. An anonymous credential, also known as AnonCreds, is a verifiable credential that has privacy-preserving properties to enable data minimization and correlation resistance. 

[[def: CRED_DEF, CDRED_DEFs]]
~ A CRED_DEF (short for "credential definition", also known as CLAIM_DEF) object contains data required for credential issuance as well as
credential validation and can be [read](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/requests.html#get-claim-def) by any Hyperledger Indy client. A CRED_DEF object references a [[ref: SCHEMA]], references a DID of the [[ref: issuer]] and can be [written](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/requests.html#claim-def) by any [[ref: issuer]] who intends to issue credentials based on that specific [[ref: SCHEMA]] to the ledger and has the proper permissions in doing so. A [[ref: SCHEMA]] is in a 1:n relation with CRED_DEF, meaning there can be many CRED_DEFs related to a SCHEMA while a CRED_DEF can only derive from one [[ref: SCHEMA]]. A CRED_DEF must be accessible to all credential participants, issuers, holders, and verifiers. CRED_DEFs are public data structures that are stored in an indy ledger.

~  The [[ref: issuer]]`s public keys for signing the attributes (one key for one attribute) are within the public_CRED_DEF which allows validation of the credentials by a [[ref: verifier]]. Since credentials are issued by using the issuers CRED_DEF, the attribute(names) of the [[ref: SCHEMA]], which is referenced within the CRED_DEF, have to be used.

~ A private_CRED_DEF is stored on the [[ref: issuer]]`s side and is an object that contains the private keys and the attributes related to a CRED_DEF. These private keys are used to create signature proofs for the issued anonymous credentials, which then can be validated in a derived form by a [[ref: verifier]]. A private_CRED_DEF never leaves the [[ref: Issuer]]'s domain and is stored securely.

~ Revokable Verifiable Credentials require CRED_DEFs which also reference a [[ref: REV_REG_DEF]] (see below).

:::todo
Differentiate more between CRED_DEF_PUBLIC and CRED_DEF_PRIVATE and decide for a final terminology.
:::

[[def: Credential Offer]]
~ A credential offer is an offering from an [[ref: issuer ]] towards a [[ref: holder]] to issue a [[ref: credential]]. The credential offer contains the details about the claims the [[ref: issuer]] intends to issue to the [[ref: holder]]. A [[ref: holder]] can reply to the [[ref: issuer]] with a [[ref: Credential Request]]. A credential offer also includes a [[ref: nonce]].

[[def: Credential Request]]
~ A credential request is a request from an [[ref: holder]] towards a [[ref: issuer]] to get a credential issued by the [[ref: issuer]]. The credential request references a preceding [[ref: Credential offer]] and defines the claims the [[ref: holder]] wants to get issued. A credential request also includes a [[ref: nonce]].

[[def: DID, DIDs]]
~ A Decentralized Identifier (DID), defined by the [W3C DID Core
Specification](https://w3c.github.io/did-core/), is a type of identifier that
enables verifiable, decentralized digital identity. A DID refers to any subject
(e.g., a person, organization, thing, data model, abstract entity, etc.) as
determined by the controller of the DID. DIDs are not used in AnonCreds itself
but there must be an DID-based, enforced relationship between the [[ref: schema
publishers]] and [[ref: issuers]] and the AnonCreds objects they publish. This
is outlined in a note in [this section](anoncreds-setup-data-flow) of this
specification.

[[def: holder, holders]]
~ A holder, also known as an identity holder, is an entity that is in possession of a [[ref: credential]]. In many use cases, the holder is also the identity [[ref: subject]]. A holder can interact with an issuer to obtain anonymous credentials. It can also derive information from anonymous credentials that can be presented to a [[ref: verifier]] to gain access to goods and services.

[[def: issuer, issuers]]
~ An issuer is one of the three entities that interact with each other within the domain of digital identities. It can assert [[ref: claims]] about a [[ref: subject]] in the form of a tamper-proof credential whose origins are cryptographically verifiable. 

[[def: link secret]]
~ One of the most significant differences between the AnonCreds and W3C [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) is how a credential is bound to the [[ref: holder]]. With the Verifiable Credential, the holder binding happens without additional interactions between the [[ref: holder]] and [[ref: issuer]]. However, this approach comes with a lack of privacy for the [[ref: holder]].
The correlatability of credentials due to the necessity of revealing a persistent identifier related to the [[ref: holder]] is one such privacy issue. 

~ AnonCreds are bound to the [[ref: holder]] with a non-correlatable secret only known to the [[ref: holder]] itself called a link secret*. Instead of a persistent identifier, the link secret as a blind attribute is sent to the  [[ref: issuer]] during credential issuance. The issuer signs every calim (including the blinded link secret) individually, enabling [[ref: selective disclosure]] (see below). It means the [[ref: issuer ]] does not know the exact value of the link secret, and the [[ref: holder]] can prove the ownership of credentials to a [[ref: verifier]] without disclosing a persistent identifier.

~ *) The link secret is known as master secret in the Hyperledger Indy source code. However, the term "master secret" is outside the source code and older publications deprecated.

[[def: nonce]]
~ A nonce is an arbitrary unique number that is used to ensure secure communications. Within AnonCreds, nonces are used during credential issuance e.g. for binding a [[ref: Credential Request]] to a [[ref: Credential Offer]].

[[def: predicates]]
~ A predicate is a boolean assertion about the value of a [[ref: claim]] without disclosing the value itself. In contrast to any signature suite and algorithm implemented according to the W3C [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/), predicates are fully supported by AnonCreds.

[[def: Non-Revocation Proof (NRP)]]
~ TODO

[[def: REV_REG_DEF]]
~ A REV_REG_DEF object (short for "revocation registry definition") contains information required for [[ref: verifiers]] in order to enable them to verify whether a revokable verifiable credential has been revoked by the issuer since issuance.

~ REV_REG_DEFs are only needed for revokable verifiable credentials and are most commonly [written](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/requests.html#claim-def) to the ledger by the owner of a [[ref: CRED_DEF]] immediatly after the [[ref: CRED_DEF]] has been written. They can be [read](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/requests.html#get-attrib) from a Hyperledger Indy Node by any client and are updated in case of the revocation of a credential, which is based on the used [[ref: CRED_DEF]].

~ Further details about Hyperledger Indy's revocation process can be found [here](https://hyperledger-indy.readthedocs.io/projects/hipe/en/latest/text/0011-cred-revocation/README.html).

[[def: REV_REG_ENTRY]]
~ A REV_REG_ENTRY object (short for "revocation registry entry") marks the current status ("revoked" or "not revoked") of one or more revokable verifiable credentials in the ledger in a privacy preserving manner. A REV_REG_ENTRY is [written](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/requests.html#revoc-reg-entry) by the owner of a [[ref: REV_REG_DEF]] respectively the issuer of the credential(s) based on a [[ref: CRED_DEF]] and its [[ref: REV_REG_DEF]]. Any REV_REG_ENTRY condensed with further required information can be [read](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/requests.html#get-revoc-reg-delta) by any Hyperledger Indy client.

~ Further details about Hyperledger Indy's revocation process can be found [here](https://hyperledger-indy.readthedocs.io/projects/hipe/en/latest/text/0011-cred-revocation/README.html).

[[def: SCHEMA]]
~ A SCHEMA object is a template that defines a set of attribute (also known as names or [[ref: claims]]) which are going to be used by [[ref: issuers]] for issuance of [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) within a Hyperledger Indy network. SCHEMAs have a name, version and can be [written](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/transactions.html#schema) to the ledger by any entity with proper permissions. SCHEMAs can be [read](https://hyperledger-indy.readthedocs.io/projects/node/en/latest/requests.html#get-schema) from a Hyperledger Indy Node by any client.

~ In Hyperledger Indy, Credentials are based on a [[ref: CRED_DEF]]. Therefore [[ref: CRED_DEFs]] reference a Schema in order to define which attribute(names) will be used within the [[ref: CRED_DEF]].

[[def: SCHEMA publisher]]
~ A SCHEMA publisher is an entity that creates a [[ref: SCHEMA]] to the ledger. It can be the [[ref: issuer]], but it can also be another entity that creates a [[ref: SCHEMA]] that can be used by many [[ref: issuer]]s to create [[ref: CRED_DEFs]] (see below).

[[def: selective disclosure]]
~ Selective disclosure is the ability to disclose partial information from an issued credential by disclosing only a subset of [[ref: claims]].

[[def: subject]]
~ A subject, also known as an identity subject, is the entity about whom [[ref: claims]] are made.  

[[def: Verifiable Data Registry]]
~ [[ref: DIDs]] and DID documents have to be stored on some kind of system, which is available (to the public, in most cases). Such a system can be a distributed ledger, a (decentralized) file system, database and others. Such an anchor for [[ref: DID]s] and DID documents is called Verifiable Data Registry. 

~ In the case of Hyperledger Indy a distributed ledger is used as Verifiable Data Registry. Besides [[ref: DIDs]] and DID documents an instance of a Hyperledger Indy network stores additional data on the ledger, which is required for issuance (e.g. [[ref: SCHEMA]] and [[ref: CRED_DEF]]), verification (e.g. [[ref: REV_REG_DEF]])) and revocation (e.g [[ref: REV_REG_ENTRY]]) of credentials.

[[def: Verifier, verifiers]]

~ A verifier is an entity that validates identity information from a [[ref: holder]] to grant access to goods and services.

[[def: Witness Delta]]
~ The witness delta is an update by the issuer of the list of revoked
credentials at the time an updated accumulator is published with a [[ref:
REV_REG_ENTRY]]. The delta tells [[ref: holders]] generating a Non-Revocation
Proof (NRP) how to adjust their witness (referencing other indexes in the public
tails file) to bring it back into harmony with the current value of the
accumulator, such that the updated witness times the private factor of the credential once again equals the accumulator value.

[[def: zero-knowledge proofs]]
~ In cryptography, the zero-knowledge proof is a method by which an entity can prove that they know a certain value without disclosing the value itself. Zero-knowledge proofs can enable [[ref: holders]] to:
~ * Combine multiple credentials into a single proof to present to a [[ref: verifier]] without revealing any correlatable identifier.
~ * [[ref: selective disclosure]] (see below) and disclose only necessary [[ref: claims]] to a [[ref: verifier]].
~ * use [[ref: predicates]] (see below) for enclosing logical expressions, such as the [[ref: holder]] being older than 18 without disclosing the value.
~ AnonCreds are capable of all three features mentioned above.


:::note
**Question**: Should the items that are AnonCreds data models be included in this?
:::
