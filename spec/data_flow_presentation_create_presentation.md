#### Generate Presentation

In step 3, the Holder creates the verifiable presentation according to the 
presentation request received from the Verifier.

Either a corresponding credential with optionally revealed attributes or a self-attested attribute must 
be provided for each requested attribute.
A presentation request may request multiple credentials from different schemas and multiple issuers.

All required schemas, public keys and revocation registries must be provided. 



##### Protocol description
indy-anoncreds/docs/dev/anoncred.pdf

Before the Holder can generate the proof, all required credentials need to be searched in the wallet
based on the provided proof request.
1. `indy_prover_search_credentials_for_proof_req`: Instead of immediately returning fetched credentials, this API call
    returns a search_handle that can be used later to fetch records by small batches 
    (with `indy_prover_fetch_credentials_for_proof_req`).

   ```rust
   pub extern fn indy_prover_search_credentials_for_proof_req(command_handle: CommandHandle,
                                                             wallet_handle: WalletHandle,
                                                             proof_request_json: *const c_char,
                                                             extra_query_json: *const c_char,
                                                             cb: Option<extern fn(
                                                                 command_handle_: CommandHandle, err: ErrorCode,
                                                                 search_handle: SearchHandle)>) -> ErrorCode {  
   ```

    * `wallet_handle`: wallet handle (created by `open_wallet`).
    * `proof_request_json`: proof request in JSON format
    * `extra_query_json`: (optional) list of extra queries that will be applied to correspondent 
      attribute/predicate `<attr_referent>` /  `<predicate_referent>`
      * Example: 
  
          ```json
         {
              "attr1_referent": {
                  "attr::age::value": "28"
              }
         }
          ```
      see [wql_query](#wql_query)  
      ::: todo Link to presentation request document
      :::
      * `cb`: callback that takes command result as parameter
      * `Returns` 
        * `search_handle`: Search handle that can be used later to fetch records by small batches 
        (with `indy_prover_fetch_credentials_for_proof_req`)


2. `indy_prover_fetch_credentials_for_proof_req`: Fetch next credentials for the requested item using proof request 
  search handle (created by `indy_prover_search_credentials_for_proof_req`)
    ```rust
    pub  extern fn indy_prover_fetch_credentials_for_proof_req(command_handle: CommandHandle,
                                                           search_handle: SearchHandle,
                                                           item_referent: *const c_char,
                                                           count: usize,
                                                           cb: Option<extern fn(command_handle_: CommandHandle, err: ErrorCode,
                                                                                credentials_json: *const c_char)>) -> ErrorCode {} 
    ```
   * `search_handle`: Search handle (created by `indy_prover_search_credentials_for_proof_req`)
   * `item_referent`: Referent of attribute/predicate in the proof request
   * `count`: Count of credentials to fetch
   * `cb`: Callback that takes command result as parameter
   * `Returns`
       * `credentials_json`: List of credentials for the given proof request.
         ```json
         [{
              "cred_info": <credential_info>,
              "interval": Optional<non_revoc_interval>
         }]
         ```

         where
         * `credential_info`:
            ```json
            {
                "referent": string, - id of credential in the wallet
                "attrs": {"key1":"raw_value1", "key2":"raw_value2"}, - credential attributes
                "schema_id": string, - identifier of schema
                "cred_def_id": string, - identifier of credential definition
                "rev_reg_id": Optional<string>, - identifier of revocation registry definition
                "cred_rev_id": Optional<string> - identifier of credential in the revocation registry definition
            }
            ```
             
         * `non_revoc_interval`:
             ```json
             {
                 "from": Optional<int>, - timestamp of interval beginning
                 "to": Optional<int>, - timestamp of interval ending
             }
             ```
         NOTE: The list of length less than the requested count means that the search iterator
         correspondent to the requested `item_referent` is completed.  


3. `indy_prover_close_credentials_search_for_proof_req`: Close credentials search for proof request (make search handle invalid)
    ```rust
    pub  extern fn indy_prover_close_credentials_search_for_proof_req(command_handle: CommandHandle,
                                                                      search_handle: SearchHandle,
                                                                      cb: Option<extern fn(command_handle_: CommandHandle, err: ErrorCode)>) -> ErrorCode {
    ```
    * `search_handle`: Search handle (created by `indy_prover_search_credentials_for_proof_req`)


4. `indy_prover_create_proof`: Creates a proof according to the given proof request
   * Either a corresponding credential with optionally revealed attributes or self-attested attribute must be provided
     for each requested attribute (see `indy_prover_get_credentials_for_pool_req`).
   * A proof request may request multiple credentials from different schemas and different issuers.
   * All required schemas, public keys and revocation registries must be provided.
   * The proof request also contains nonce.
   * The proof contains either proof or self-attested attribute value for each requested attribute.
   
    ```rust
    pub extern fn indy_prover_create_proof(command_handle: CommandHandle,
                                           wallet_handle: WalletHandle,
                                           proof_request_json: *const c_char,
                                           requested_credentials_json: *const c_char,
                                           master_secret_id: *const c_char,
                                           schemas_json: *const c_char,
                                           credential_defs_json: *const c_char,
                                           rev_states_json: *const c_char,
                                           cb: Option<extern fn(command_handle_: CommandHandle, err: ErrorCode,
                                                                proof_json: *const c_char)>) -> ErrorCode {
    ```
   * `wallet_handle`: wallet handle (created by `open_wallet`).
   * `proof_request_json`: proof request in JSON format
   * `requested_credentials_json`: either a credential or self-attested attribute for each requested attribute
     ```json
     {
        "self_attested_attributes": {
            "self_attested_attribute_referent": string
        },
        "requested_attributes": {
            "requested_attribute_referent_1": {
               "cred_id": string, 
               "timestamp": Optional<number>, 
               "revealed": <bool> 
            },
            "requested_attribute_referent_2": {
               "cred_id": string, 
               "timestamp": Optional<number>, 
               "revealed": <bool> 
            }
        },
        "requested_predicates": {
            "requested_predicates_referent_1": {
                "cred_id": string,
                "timestamp": Optional<number>
            }
        }
     }
     ```
     
   * `master_secret_id`: the id of the master secret stored in the wallet
   * `schemas_json`: all schemas participating in the proof request
     ```json
     {
         <schema1_id>: <schema1>,
         <schema2_id>: <schema2>,
         <schema3_id>: <schema3>,
     }
     ```
   * `credential_defs_json`: all credential definitions participating in the proof request
     ```json
     {
         "cred_def1_id": <credential_def1>,
         "cred_def2_id": <credential_def2>,
         "cred_def3_id": <credential_def3>,
     }
     ```
   * `rev_states_json`: all revocation states participating in the proof request
     ```json
     {
         "rev_reg_def1_id or credential_1_id": {
             "timestamp1": <rev_state1>,
             "timestamp2": <rev_state2>,
         },
         "rev_reg_def2_id or credential_1_id": {
             "timestamp3": <rev_state3>
         },
         "rev_reg_def3_id or credential_1_id": {
             "timestamp4": <rev_state4>
         },
     }
     ```
     
      Note: use `credential_id` instead `rev_reg_id` in case proving several credentials from the same revocation registry.
   * `cb`: Callback that takes command result as parameter.



The presentation created by the Holder has the following JSON format:

```json
{
    "requested_proof": {
        "revealed_attrs": {
            "requested_attr1_id": {
                "sub_proof_index": number,
                "raw": string,
                "encoded": string
            },
            "requested_attr4_id": {
                "sub_proof_index": number,
                "raw": string,
                "encoded": string
            }
        },
        "revealed_attr_groups": {
            "requested_attr5_id": {
                "sub_proof_index": number,
                "values": {
                    "attribute_name": {
                        "raw": string,
                        "encoded": string
                    }
                }
            }
        },
        "unrevealed_attrs": {
            "requested_attr3_id": {
                "sub_proof_index": number
            }
        },
        "self_attested_attrs": {
            "requested_attr2_id": self_attested_value
        },
        "predicates": {
            "requested_predicate_1_referent": {
                "sub_proof_index": int
            },
            "requested_predicate_2_referent": {
                "sub_proof_index": int
            }  
        }
    }
    "proof": {
        "proofs": [
            <credential_proof>,
            <credential_proof>,
            <credential_proof>
        ],
        "aggregated_proof": <aggregated_proof>
    }
    "identifiers": [{schema_id, cred_def_id, Optional<rev_reg_id>, Optional<timestamp>}]
}

```

Example:

```json
{
    "requested_proof": {
        "revealed_attrs": {
            "attr4_referent": {
                "sub_proof_index": 0,
                "raw": "graduated",
                "encoded": "2213454313412354"
            },
            "attr5_referent": {,
                "sub_proof_index": 0,
                "raw": "123-45-6789",
                "encoded": "3124141231422543541"
            },
            "attr3_referent": {
                "sub_proof_index": 0, 
                "raw": "Bachelor of Science, Marketing",
                "encoded": "12434523576212321"
            }
        },
        "self_attested_attrs": {
            "attr1_referent": "Alice",
            "attr2_referent": "Garcia",
            "attr6_referent": "123-45-6789"
        },
     "unrevealed_attrs": {

     },
     "predicates": {
      "predicate1_referent": {
       "sub_proof_index": 0
      }
     }
     },
     "proof": [

     ]#ValidityProofthatAcmecancheck"identifiers": [
      #IdentifiersofcredentialswereusedforProofbuilding{
      "schema_id": job_certificate_schema_id,
      "cred_def_id": faber_transcript_cred_def_id,
      "rev_reg_id": None,
      "timestamp": None
     }
     }
    }
```



    wallet_handle: wallet handler (created by Wallet::open_wallet).
    proof_request_json: proof request json { "name": string, "version": string, "nonce": string, "requested_attributes": { // set of requested attributes "<attr_referent>": <attr_info>, // see below ..., }, "requested_predicates": { // set of requested predicates "<predicate_referent>": <predicate_info>, // see below ..., }, "non_revoked": Optional<<non_revoc_interval>>, // see below, // If specified prover must proof non-revocation // for date in this interval for each attribute // (can be overridden on attribute level) }
    requested_credentials_json: either a credential or self-attested attribute for each requested attribute { "self_attested_attributes": { "self_attested_attribute_referent": string }, "requested_attributes": { "requested_attribute_referent_1": {"cred_id": string, "timestamp": Optional, revealed: }}, "requested_attribute_referent_2": {"cred_id": string, "timestamp": Optional, revealed: }} }, "requested_predicates": { "requested_predicates_referent_1": {"cred_id": string, "timestamp": Optional }}, } }
    master_secret_id: the id of the master secret stored in the wallet
    schemas_json: all schemas json participating in the proof request { <schema1_id>: <schema1_json>, <schema2_id>: <schema2_json>, <schema3_id>: <schema3_json>, }
    credential_defs_json: all credential definitions json participating in the proof request { "cred_def1_id": <credential_def1_json>, "cred_def2_id": <credential_def2_json>, "cred_def3_id": <credential_def3_json>, }
    rev_states_json: all revocation states json participating in the proof request { "rev_reg_def1_id": { "timestamp1": <rev_state1>, "timestamp2": <rev_state2>, }, "rev_reg_def2_id": { "timestamp3": <rev_state3> }, "rev_reg_def3_id": { "timestamp4": <rev_state4> }, }
