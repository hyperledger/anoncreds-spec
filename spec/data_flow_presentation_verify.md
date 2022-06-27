#### Verify Presentation

In step 7, 8, and 9 of the 
[AnonCreds Presentation Data Flow](#anoncreds-presentation-data-flow), 
the Verifier collects the required information and verifies the verifiable presentation and accepts it if the
signature is valid, otherwise rejects the verifiable presentation.

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
