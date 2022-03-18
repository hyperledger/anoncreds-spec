## Terminology

These terms are defined by this specification:
[[def: Subject]]
~ A subject, also known as an identity subject, is the entity that a digital identity belongs to.  

[[def: Claim]]
~ A claim is a part of digital identity related to a subject. A claim can be attested by the identity subject itself, or it can be asserted by another entity. 

[[def: Credential]]
~ A credential is a set of claims about an identity subject. A verifiable credential is a tamper-proof credential whose authorship is cryptographically verifiable. An anonymous credential is a verifiable credential that has privacy-preserving properties to enable data minimization and correlation resistance. 

[[def: Issuer]]
~ An issuer is one of the three entities that interact with each other within the domain of digital identities. It can assert claims about a subject in the form of a tamper-proof credential whose origins are cryptographically verifiable. 

[[def: Verifier]]

~ A verifier is an entity that validates identity information from a holder to grant access to goods and services.

[[def: Holder]]
~ A holder, also known as an identity holder, is the entity that is in possession of the credentials. In most use cases, the holder is also the identity subject. A holder can interact with an issuer to obtain anonymous credentials. It can also create derived information from anonymous credentials that can be presented to a verifier to gain access to goods and services.

[[def: Schema]]

~ A SCHEMA object is a template defining the set of attributes (also known as names, claims) in an AnonCreds verifiable credential. A SCHEMA must be accessible to all verifiable credential participants, issuers, holders, and verifiers.

[[def: Claim_Def]]

~ A CLAIM_DEF object derived from a SCHEMA contains key information regarding the issuer. A SCHEMA is in a 1:n relation with CLAIM_DEF, meaning there can be many CLAIM_DEFs related to a SCHEMA while a CLAIM_DEF can only derive from one SCHEMA. A CLAIM_DEF must be accessible to all verifiable credential participants, issuers, holders, and verifiers.

[[def: Revoc_Reg_Def]]

[[def: Revoc_Reg_Entry]]

[[def: zCap]]
::: todo
Finalize glossary entries

**Question**: Should the items that are AnonCreds data models be included in this?
:::
