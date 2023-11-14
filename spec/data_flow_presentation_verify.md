### Verify Presentation

In step 8, 9, and 10 of the [AnonCreds Presentation Data
Flow](#anoncreds-presentation-data-flow), the [[ref: Verifier]] collects the required
information necessary to verify the verifiable presentation, attempts to verify
the proofs that make up the presentation and returns either a `true` if successful,
and a `false` if any of the proofs fail, or if the presentation does not meet
the presentation request.

In the [previous section on presentation generation](#generate-presentation),
the contents of the presentation is described. In verifying the presentation,
each proof is extracted from the presentation and verified. The following
sub-sections cover the verification of the proofs related to the source
credentials (the `eq_proof`, any `ge_proof`s, and the `aggregate_proof`), and
any non-revocation proofs in the presentation.

For each source credential in the presentation, the [[ref: Verifier]] must
retrieve (possibly from its cache, otherwise from the [[ref: VDR]]) the
published [[ref: Schema]] and [[ref: Credential Definition]] based on the
`schema_id` and `cred_def_id` values from the `identifiers` data item. For the
non-revocation proof, additional issuer published data must be collected, as
described below.

While in this section we mostly focus on the verification of the proofs in the
presentation, there are other data elements included, such as the revealed
attributes, self-attested attributes, and the [[def: Presentation Request]] for
which the presentation was generated. Some of these values contribute to the
verification process, as noted below. Finally, an important part of the
verification process is **not** carried out in AnonCreds v1.0 and must be
performed by the calling [[ref: verifier]]. We highlight that as well.

#### Verify Validity Proofs

An AnoncCreds validity proof is the combination of both equality and inequality predicate proofs. The validity proof is bound to the primary credential by the $\widehat{m_2}$ value that is presented in both proofs. The validity proof is verified by the following steps:

- For each credential $C_p$, take each sub-proof $Pr_C$ and compute
$$ \widehat{T} \leftarrow \left(
    \frac{Z}
    { \left(
        \prod_{j \in \mathcal{A}_r}{R_j}^{m_j}
    \right)
    (A')^{2^{596}}
    }\right)^{-c}
    (A')^{\widehat{e}}
    \left(\prod_{j\in (\mathcal{A}_{\widetilde{r}})}{R_j}^{\widehat{m_j}}\right)
    (S^{\widehat{v}})\pmod{n}. $$
Add $\widehat{T}$ to $\widehat{\mathcal{T}}$ .

- For each predicate $p$: 
$$ \Delta' \leftarrow \begin{cases}
z_j; & if\  * \equiv\ \leq
z_j-1; & if\ * \equiv\ <
z_j; & if\ * \equiv\ \geq
z_j+1; & if\ * \equiv\ >
\end{cases} $$
$$
a \leftarrow \begin{cases}
-1 & if\ * \equiv \leq or <
1  & if\ * \equiv \geq or >
\end{cases}
$$

- Using $Pr_p$ and $\mathcal{C}$ compute 
$$
\widehat{T_i} \leftarrow T_i^{-c}Z^{\widehat{u_i}} S^{\widehat{r_i}}\pmod{n}_{1\leq i \leq 4};
\widehat{T_{\Delta}} \leftarrow \left(T_{\Delta}^{a}Z^{\Delta'}\right)^{-c}Z^{\widehat{m_j}}S^{a\widehat{r_{\Delta}}}\pmod{n};
\widehat{Q}\leftarrow (T_{\Delta}^{-c})\prod_{i=1}^{4}T_i^{\widehat{u_i}}(S^{\widehat{\alpha}})\pmod{n},
$$
and add these values to  $\widehat{\mathcal{T}}$ in the order $\widehat{T_1},\widehat{T_2} ,\widehat{T_3},\widehat{T_4},\widehat{T_{\Delta}},\widehat{Q}$.

#### Verify Non-Revocation Proof

If the presentation includes one or more Non-Revocation Proofs (NRPs) the
[[ref: verifier]] must also extract from the verifiable presentation the NRPs
and process each of them. If any of the NRPs cannot be verified because one
or more of the attributes/predicates came from a revoked credential, the
overall status of the presentation is rejected as not verifiable. The following
outlines the process for verifying an NRP.

The [[ref: verifier]] begins by extracting from the section of the presentation
for a given revocable credential the `non_revoc_proof` and `identifiers` data
items. The [[ref: verifier]] must retrieve (possibly from its cache, otherwise
from the [[ref: VDR]]) the published [[ref: RevRegEntry]] given the `rev_reg_id`
and `timestamp` values from the `identifiers` data item. The [[ref: verifier]]
extracts the `accumulator` item from the [[ref: RevRegEntry]] retrieved. Note
that the [[ref: verifier]] does not need to collect the revocation status of all
of the credentials in the registry, nor the contents of the tails file for the
[[ref: RevReg]]. Only the issuer and [[ref: holder]] needs that data. During the
verification process, the [[ref: verifier]] does not learn the index of the
[[ref: holder]]'s credential in the [[ref: RevReg]].

Once the [[ref: verifier]] gets the data in the `non_revoc_proof` data item from
the presentation for the NRP being processed, plus the accumulator from
appropriate [[ref: RevRegEntry]], the following steps are carried out to verify
the NRP.

Calculation for NRP:

$$\widehat{T_1} \leftarrow E^{c_H}\cdot h^{\widehat{\rho}} \cdot \widetilde{h}^{\widehat{o}} $$
$$\widehat{T_2} \leftarrow E^{\widehat{c}}\cdot h^{-\widehat{m}}\cdot\widetilde{h}^{-\widehat{t}}$$
$$\widehat{T_3} \leftarrow\left(\frac{e(h_0\mathcal{G},\widehat{h})}{e(A,y)} \right)^{c_H} \cdot e(A,\widehat{h})^{\widehat{c}}\cdot e(\widetilde{h},\widehat{h})^{\widehat{r}}\cdot e(\widetilde{h},y)^{-\widehat{\rho}}\cdot e(\widetilde{h},\widehat{h})^{-\widehat{m}}\cdot e(h_1,\widehat{h})^{-\widehat{m_2}}\cdot e(h_2,\widehat{h})^{-\widehat{s}}$$
$$\widehat{T_4} \leftarrow\left(\frac{e(\mathcal{G},\mathrm{acc})}{e(g,\mathcal{W})z}\right)^{c_H} \cdot e(\widetilde{h},\mathrm{acc})^{\widehat{r}}\cdot e(1/g,\widehat{h})^{\widehat{r'}}$$
$$\widehat{T_5} \leftarrow D^{c_H}\cdot g^{\widehat{r}}\widetilde{h}^{\widehat{o'}}$$
$$\widehat{T_6} \leftarrow  D^{\widehat{r''}}\cdot g^{-\widehat{m'}} \widetilde{h}^{-\widehat{t'}}$$
$$\widehat{T_7} \leftarrow \left(\frac{e(pk\cdot\mathcal{G},\mathcal{S})}{e(g,g')}\right)^{c_H}\cdot e(pk\cdot \mathcal{G},\widehat{h})^{\widehat{r''}}\cdot e(\widetilde{h},\widehat{h})^{-\widehat{m'}}\cdot e(\widetilde{h},\mathcal{S})^{\widehat{r}}$$
$$\widehat{T_8} \leftarrow \left(\frac{e(\mathcal{G},u)}{e(g,\mathcal{U})}\right)^{c_H}\cdot e(\widetilde{h},u)^{\widehat{r}}\cdot e(1/g,\widehat{h})^{\widehat{r'''}}$$

Then all these values are added to $\widehat{T}$. This is then added with the validity proof which when hashed with $\mathcal{C}$ and $n_1$(received from [[ref: holder]]) re constructs the challenge hash $\widehat{c_H}$.
If $\widehat{c_H} = c_H$, then the proof is valid.

The NRP is bound to the primary credential by the $\widehat{m_2}$ value that is presented in both proofs.

The verification code MUST surface to the [[ref: verifier]] if any part of the
presentation, including any NRP(s), fail cryptographic verification. The
verification code MAY surface additional detail about what part of the
presentation failed, such as which NRP failed verification (if any).

The [[ref: verifier]] SHOULD evaluate the presentation to make sure that the
[[ref: holder]] provided all requested NRPs. Notably, if any expected NRPs
are not received in the presentation, the [[ref: verifier]] SHOULD check to see
if the given credential type is revocable. If not, it is acceptable that no
NRP was received. However, if the credential used in the generation of the
proof is revocable, and the [[ref: holder]] did not provide the NRP, the
verification code SHOULD surface to the [[ref: verifier]] that the presentation
failed cryptographic verification.

#### Other Verification

The AnonCreds verification code checks some additional non-cryptographic
elements of the presentation.

- That all of the requested attributes to be revealed are covered as either
  `revealed` or `unrevealed` attributes. Any missing attributes trigger a `false` verification.
- That the non-revocation proofs (NRPs) meet the revocation interval requirements of the
  [[ref: Presentation Request]]. Note that the acceptable revocation interval may (and usually is)
  larger than the `from` and `to` values in the [[ref: Presentation Request]] as described [here](#request-non-revocation-proofs).

#### Encoding Not Verified

[[ref: Verifiers]] using AnonCreds 1.0 **MUST** verify that revealed attributes
presented by the [[ref: Holder]] encode to the values signed by the [[ref:
Issuer]]. AIf not done, a malicious [[ref: Holder]] could successfully
substitute a different revealed attribute than what the issuer encoded and
signed.

As noted in the [issuance section of this
specification](#encoding-attribute-data) the encoding of raw attribute data to
the integers that are actually signed by the [[ref: Issuer]] is defined and
handled by the [[ref: Issuer]], and is not defined in this specification, nor
performed by the implementation. As such, the verification of the encoding is
likewise delegated to the [[ref: Verifier]], enabling the risk to the verifier
outlined above.
