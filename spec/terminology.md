## Terminology

These terms are defined by this specification:
[[def: Claim]]


[[def: Credential]]


[[def: Issuer]]
~ An issuer is one of the three entities that interact with each other within the domain of digital identities. It can assert claims about a subject in the form of a tamper-proof credential whose origins are cryptographically verifiable. 

[[def: Holder]]
~ An

[[def: Verifier]]



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
