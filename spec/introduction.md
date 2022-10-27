## Introduction

AnonCreds ZKP verifiable credentials provide capabilities that many see as important for digital identity use cases in particular, and verifiable data in general. These features include:

- A full implementation of the Layer 3 verifiable credential “Trust Triangle” of the [Trust over IP Model](https://trustoverip.org/wp-content/toip-model/).
- Complete flows for issuing verifiable credentials (Issuer to Holder), and requesting, generating and verifying presentations of verifiable claims (Holder to Verifier).
- Fully defined data models for all of the objects in the flows, including verifiable credentials, presentation requests and presentations sourced from multiple credentials.
- Fully defined applications of cryptographic primitives.
- The use of Zero Knowledge Proofs (ZKPs) in the verifiable presentation process to enhance the privacy protections available to the holder in presenting data to verifiers, including:
  - Blinding issuer signatures to prevent correlation based on those signatures.
  - The use of unrevealed identifiers for holder binding to prevent correlation based on such identifiers.
  - The use of predicate proofs to reduce the sharing of PII and potentially correlating data, especially dates (birth, credential issuance/expiry, etc.).
  - A revocation scheme that proves a presentation is based on credentials that have not been revoked by the issuers without revealing correlatable revocation identifiers.

This version (v1.0) removes any dependence on Hyperledger Indy by removing any requirements related to the storage of the objects used in AnonCreds, whether they be stored remotely on a “verifiable data registry” (including Hyperledger Indy) or in local secure storage.

The following diagram and explanation below give a high level overview of all AnonCreds Data objects, their relations and the owner respectively receiver of each of the data objects. 

![AnonCreds Data Model Overview](https://raw.githubusercontent.com/AnonCreds-WG/anoncreds-spec/main/spec/diagrams/anoncreds-visual-data-model-overview-simple.png)

AnonCreds require a [[ref: Verifiable Data Registry]] (VDR). A [[ref: VDR]] (box in green) is a public registry (often a ledger) used for storing some of the AnonCreds data objects. 

[[ref: Schemas]] are public and reusable templates, which define the attributes of issued AnonCreds [[ref: credentials]] and can be written (e.g. by an [[ref: Issuer]]) to the [[ref: VDR]]. 

Based on a [[ref: Schema]], arbitrary [[ref: Issuer]]s (box in yellow) can create a Credential Definition ([[ref:CRED_DEF]]) which references the [[ref: Schema]]. A [[ref:CRED_DEF]] enables [[ref: Issuers]] to issue AnonCreds [[ref: Credentials]] to [[ref: Holders]] and enables [[ref:Verifier]]s (box in red) to verify [[ref: Credentials]] issued to and presented by a [[ref:Holder]]. A [[ref:CRED_DEF]] consists of two pieces of information: First, the [[ref:CRED_DEF]]_PRIVATE includes the private signing keys of the [[ref:Issuer]] for signing and issuing AnonCreds [[ref: Credentials]] to [[ref: holders]] and is kept private by the [[ref: Issuer]]. Second, the [[ref:CRED_DEF]]_PUBLIC includes the public keys of the [[ref:Issuer]], has to be stored on a [[ref:VDR]] and is used by [[ref: holders]] and arbitrary [[ref:Verifiers]] in order to verify AnonCreds [[ref: Credentials]] issued to and presented by [[ref: Holders]]. 

Each [[ref: Holder]] (box in blue) has a [[ref: link secret]], which enables [[ref: Credential]] to [[ref: Holder]] binding: Whenever a [[ref: Credential]] is issued to a [[ref: Holder]] by an [[ref: Issuer]], the [[ref: Holder]] sends a blinded version of the [[ref: link secret]] to the [[ref: Issuer]] before the credential is issued to the [[ref: Holder]]. The blinded version of the [[ref: link secret]] gets then signed along with the other attributes within the AnonCreds [[ref: Credential]] by the [[ref: Issuer]] and sent to the [[ref: Holder]]. Since the [[ref:Holder]] uses a blinded version of the same [[ref:link secret]] for every [[ref: Credential]] that is issued to the [[ref: Holder]], the [[ref: Holder]] can proof the affiliation of multiple [[ref:Credentials]] at presentation time.

[[ref: Holders]] never present the raw signed credential data they received from [[ref: Issuers]] to [[ref: Verifiers]] for verification purposes. Instead a [[ref: Verifiable Presentation]] is created by the [[ref: Holder]] and sent to the [[ref: Verifier]]. A [[ref: Verifiable Presentation]] is a derivation of an AnonCreds [[ref: Credential]] which allows a [[ref: Holder]] to proof the correctness of the revealed credential data, without revealing the original raw credential signature(s). [[ref: Verifiers]] process [[ref: Verifiable Presentation]]s for verification of [[ref: credential]] data.

AnonCreds allows the revocation of [[ref: Credentials]] issued to [[ref: Holders]] by [[ref: Issuers]]. In case revocation is required, at least one Revocation Definition Registry ([[ref: Revocation Registry Definition ]]), which references the associated [[ref: Credential Definition]]_PUBLIC, has to be stored to the [[ref: VDR]] by the [[ref: Issuer]] in addition to the [[ref:CRED_DEF]]_PUBLIC. A [[ref: Revocation Registry Definition]] can have Revocation Registry Entries ([[ref: Revocation Registry Entry]]). When one or more credentials have to be revoked, the [[ref: Issuer]] stores a [[ref: Revocation Registry Entry]] with the updated status of the credentials in question to the [[ref: VDR]]. [[ref: Holder]] use these additional pieces of information in order to generate a [[ref:Non-Revocation Proof]]. A [[ref:Non-Revocation Proof]] proves to a [[ref:Verifier]], that the credential the [[ref:Holder]] presented to the [[ref:Verifier]], has not been revoked. [[ref: Verifiers]] use the information provided by a [[ref:Revocation Registry Definition]] and associated [[ref: Revocation Registry Entry]]s to verify the [[ref: Holder]]`s [[ref:Non-Revocation Proof]]. A [[ref: Tails File]] supports the revocation mechanism. Each [[ref: Revocation Registry Definition]] requires exactly one Tails File.
