### AnonCreds Issuance Data Flow

```mermaid
sequenceDiagram
    autonumber
    #participant L as Verifiable<br>Data Registry
    #participant SP as Schema Publisher
    participant I as Issuer
    participant H as Holder  


    loop until credential offer not accepted by holder
        
        I ->> I: issuer_create_credential_offer<br>(wallet_handle, cred_def_id)
        I ->> H: Send offer-credential
        H ->> H: Check offer-credential (TODO: Elaborate a bit more?)

        alt credential offer not accepted            
            H ->> I: send propose-credential
            I ->> I: Check propose-credential
        else credential offer accepted
            H ->> I: prover_create_credential_req(wallet_handle, DID,<br>credential_offer, cred_def, master_secret_id)
            H ->> I: send credential request
        end
    end

    I ->> I: Prepare RAW attribute values and encode them
    I ->> I: issuer_create_credential(wallet_handle,<br>credential_offer, credential_request,<br>transcript_cred_values, None, None)
    I ->> H: Send credential
    H ->> H: prover_store_credential(wallet_handle, None,<br>credential_request, meta_data, credential,<br>credential_definition, None)

    rect rgb(191, 223, 255)
      Note left of H: 💡The "Verifier", "Schema Publisher"<br>and "Verifiable Data Registry" roles are<br>omitted in this<br>diagram, since<br>it is not required<br>for the setup
    end
```

::: todo
Document the steps of Issuance -- Credential Offer, Credential Request and Issue Credential
:::



#### Credential Offer

#### Credential Request

#### Issue Credential
