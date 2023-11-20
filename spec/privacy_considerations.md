## Privacy Considerations

The business expression of the AnonCreds privacy goal is to allow a verifiable
credential holder to minimize the amount of information they share with others
in presentations and to minimize the opportunities for holder [[ref:
correlation]] (also called [[ref: unlinkability]]) across issuers and verifiers
when using verifiable credentials and presentations. While it is understood that
the [[ref: claims]] that a holder shares in a verifiable presentation may be
correlatable, the act of providing an AnonCreds verifiable presentation must not
provide [[ref: correlatable]] data.

AnonCreds accomplishes its privacy goals using the following techniques, all of
which are based on forms of [[ref: zero-knowledge proofs]], as described in this
specification.

- Holders use a [[ref: link secret]] to enable the binding of the credentials
  they receive from issuers, such that:
  - Issuers do not receive an identifier for the holder that can be correlated
    with other issuers during the credential issuance process.
  - In a presentation, verifiers receive proof of the holder's knowledge of the
    link secret without receiving an identifier that can be correlated with
    other issuers.
  - In a presentation, verifiers do not receive an identifier that can be
    correlated with the issuers of the source credentials.
  - In a presentation, holders prove all of the credentials they were issued are
    bound to the same link secret without revealing a correlatable identifier to
    verifiers.
- In a presentation, the issuer provides proof of the issuers signatures without
  revealing the signatures itself, which can be used as a correlatable
  identifier.
- [[ref: Holders]] can (verifiably) selectively disclose [[ref: claims]] from
  source credentials.
- [[ref: Holders]] can (verifiably) prove [[ref: predicate]] expressions about
  integer [[ref: claims]] from source credentials.
- [[ref: Holders]] can in some situations, produce [[ref: non-revocation
  proofs]] (NRPs) about the source credentials in a presentation without
  revealing a correlatable identifier for themselves or the source credentials.
  - If credentials are both revocable and not revoked, the [[ref: Holder]] can
    produce a NRP for presented source credentials.
  - If credentials are both revocable and revoked, the [[ref: Holder]] cannot
    produce a NRP for presented source credentials.
  - If credentials are not revocable, the [[ref: Holder]] cannot produce a NRP
    for presented source credentials.

The further privacy properties are stated according to [Section 5 of
RFC6973](https://tools.ietf.org/html/rfc6973#section-5).

### Surveillance

In the strict scope of this specification, the activities of the parties are not
subject to surveillance due to the presentation [[ref: data minimization]] and
[[ref: unlinkability]] characteristics of the credential issuance and presentation
actions. However, in any digital trust ecosystem, there are other components
that could lead to surveillance depending on how they are implemented. These
include:

- The interactions of the various participants could be surveilled depending on
  how the various objects (credentials, presentations, etc.) are exchanged. For
  example, HTTP traffic amongst [[ref: Issuers]], [[ref: Holders]] and [[ref:
  Verifiers]] could be correlated.
  - Using a secure, encrypted, peer-to-peer communication channel such as
    [DIDComm] can be used to mitigate the surveillance risk.
- If the [[ref: Holder]] must request credential revocation information directly
  from an [[ref: Issuer]] when creating a presentation, the [[ref: Issuer]]
  could surveil the use of a credential by the [[ref: Holder]]. Further, if the
  [[ref: Verifier]] also must request revocation data from an [[ref: issuer]] to
  verify a received presentation, the [[ref: Issuer]] could correlate the use of
  credentials by [[ref: Holders]] and with what [[ref: Verifiers]] the
  credentials are being used.
  - This is often called the [[ref: Call Home]] problem.
  - [[ref: Distributed Ledgers]] are often used in Digital Trust ecosystems to
    mitigate such surveillance, where public data needed to generate and verify presentations
    are read from public ledgers operated by a set of "uninterested" parties.
  - Other techniques are possible to mitigate such surveillance when ledgers are
    not used.  For example, [[ref: Verifiers]] requesting a presentation could
    retrieve the necessary revocation data from [[ref: Issuers]] and provide
    that data to the [[ref: Holder]]. The Issuer could still surveil the
    verifications occurring, but would not know what [[ref: Holders]] were
    providing the presentations.

### Stored Data Compromise

The compromise of stored data held by the various agents in a digital trust
ecosystem must be mitigated by the respective agent software and hardware, and
is out of scope of this specification. The stored data of an individual agent
shall be protected by implementing best practices in securing mobile wallet
applications and IT infrastructure, like [ISO27001] and [Information Security
Management] systems (ISMS).

[ISO27001]: https://www.iso.org/standard/27001
[Information Security Management]: https://en.wikipedia.org/wiki/Information_security_management

### Unsolicited Traffic

The issue of unsolicited traffic is out of scope of this specification. It is a
concern of the agents into which the AnonCreds library is embedded. The
prevention of unsolicited traffic shall be accomplished by implementing best
practices in securing mobile wallet applications and IT infrastructure, like
[ISO27001] and [Information Security Management] systems (ISMS).

### Misattribution

The risk of misattribution when using AnonCreds is mitigated by the participants
following the specification. However, as noted in the [warning found in this
section](#generating-a-credential-definition-without-revocation-support) of this
specification, a malicious [[ref: issuer]] could deliberately generate a weak
private key for use in issuing AnonCreds credentials such that a unique
identifier for a holder can be determined via a brute force attack. In that
case, anyone applying the brute force attack could issue credentials as it they
were from the [[ref: Issuer]], possibly with false information. This risk
further incentivize [[ref: Issuers]] not to deliberately weaken their keys.

If a third party gains access to the secure storage of a [[ref: Holder]] (or a
copy thereof), they could present information as if they were the [[ref:
Holder]]. The stored data of an individual agent shall be protected by
implementing best practices in securing mobile wallet applications and IT
infrastructure, like [ISO27001] and [Information Security Management] systems
(ISMS).

### Correlation

As noted in the introduction to this section, AnonCreds v1 uses two important
techniques to prevent correlation in the issuance and presentation of verifiable
data:

- The use of [[ref: zero knowledge proofs]] in eliminating an correlatable (linkable)
  data as part of the process of issuing AnonCreds verifiable credentials and
  presenting AnonCreds verifiable presentations. While the credential data
  issued and presented MAY include correlatable data elements, the issuing and
  presenting processes do not provide correlatable data elements.
- The data minimization features supported in presenting data, such that the
  [[ref: holder]] can selectively disclose only relevant information from the
  credential based on the business purpose of the presentation, and the use of
  [[ref: predicates]] that support proving an expression based on an integer
  claim in a verifiable credential without revealing the claim itself.

### Identification

AnonCreds v1 enables, but does not itself provide, identification. The [[ref:
unlinkability]] and [[ref: data minimization]] capabilities inherent in
AnonCreds enable the [[ref: Holder]] to provide presentations anonymously.
However, the [[ref: claims]] within the presentation are from verifiably issued
credentials, and as such, may be used for identification.

### Secondary Use

The disclosed [[ref: claims]] and [[ref: predicates]] presented by the [[ref:
Holder]] to the [[ref: Verifier]] are necessarily visible to the [[ref:
verifier]]. The secondary use of that data is outside the scope of the AnonCreds
specification, and is a governance issue. A [[ref: holder]] that presents data
to a [[ref: verifier]] using AnonCreds cannot "revoke" that the presentation was
made as the [[ref: verifier]] already possesses the disclosed data.

### Disclosure

The disclosed [[ref: claims]] and [[ref: predicates]] presented by the [[ref:
Holder]] to the [[ref: Verifier]] are necessarily visible to the [[ref:
verifier]]. The disclosure of that data by the [[ref: verifier]] is outside the
scope of the AnonCreds specification, and is a governance issue. A [[ref:
holder]] that presents data to a [[ref: verifier]] using AnonCreds cannot
"revoke" that the presentation was made as the [[ref: verifier]] already possesses the
disclosed data.

### Exclusion

The participants ([[ref: issuers]], [[ref: holders]], [[ref: verifiers]]) using
AnonCreds may apply whatever policies (including refusal) they want in issuing,
holding, requesting, presenting, and verifying AnonCreds verifiable credential
and presentations. Such policies are out outside the
scope of the AnonCreds specification, and are governance issues.
