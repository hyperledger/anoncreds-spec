#### Verify Presentation

In step 7, 8, and 9 of the [AnonCreds Presentation Data
Flow](#anoncreds-presentation-data-flow), the Verifier collects the required
information and verifies the verifiable presentation and accepts it if the
signature is valid, otherwise rejects the verifiable presentation.

This section covers the overall verification process of the attributes,
predicates and link secret. Following that is a section that specifies the
process for [verifying the non-revocation proofs](#verify-non-revocation-proof)
(if any) in the presentation.

```rust
pub extern fn indy_verifier_verify_proof(command_handle: CommandHandle,
                                         proof_request_json: *const c_char,
                                         proof_json: *const c_char,
                                         schemas_json: *const c_char,
                                         credential_defs_json: *const c_char,
                                         rev_reg_defs_json: *const c_char,
                                         rev_regs_json: *const c_char,
                                         cb: Option<extern fn(command_handle_: CommandHandle, err: ErrorCode,
                                                              valid: bool)>) -> ErrorCode {}
```

* `proof_request_json`: Proof request in JSON format.
* `proof_json`: Proof for the given proof request.
* `schemas_json`: Collection of all schemas participating in the proof.
* `credential_defs_json`: Collection of all credential definitions participating in the proof.
* `rev_reg_defs_json`: Collection of all revocation registry definitions participating in the proof.

   ```json
   {
       "rev_reg_def1_id": <rev_reg_def1>,
       "rev_reg_def2_id": <rev_reg_def2>,
       "rev_reg_def3_id": <rev_reg_def3>,
   }
    ```

* `rev_regs_json`: Collection of all revocation registries participating in the proof.
    ```json
    {
        "rev_reg_def1_id": {
            "timestamp1": <rev_reg1>,
            "timestamp2": <rev_reg2>,
        },
        "rev_reg_def2_id": {
            "timestamp3": <rev_reg3>
        },
        "rev_reg_def3_id": {
            "timestamp4": <rev_reg4>
        },
    }
    ```
* `cb`: Callback that takes command result as parameter.
* `Returns`
    * `valid`: true - if signature is valid, false - otherwise

##### Verify Non-Revocation Proof

If the presentation includes one or more Non-Revocation Proofs (NRPs) the
[[ref: verifier]] must also extract from the verifiable presentation the NRPs
and process each proof. If any of the NRPs cannot be verified because one
or more of the attributes/predicates came from a revoked credential, the
overall status of the presentation is rejected -- not verifiable. The following
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

:::todo
To Do: Outline the NRP verification calculation.
:::

:::todo
To Do: Is there a separate process to bind the NRP to the credential?
:::

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

