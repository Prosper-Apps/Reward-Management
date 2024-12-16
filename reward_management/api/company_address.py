import frappe
from frappe.model.document import Document

@frappe.whitelist(allow_guest=True)
def get_company_address():
    # Fetch fields from the single doctype
    company_address = frappe.db.get_single_value("Company Address", "address")
    company_email = frappe.db.get_single_value("Company Address", "email")
    company_website = frappe.db.get_single_value("Company Address", "website")
    
    # Fetch child table data
    company_mobile_data = frappe.get_all(
        "Company Mobile Child", 
        filters={"parent": "Company Address"},
        fields=["mobile_number"]
    )
    
    # Prepare the response dictionary
    response = {
        "address": company_address,
        "email": company_email,
        "website": company_website,
        "mobile_numbers": [entry["mobile_number"] for entry in company_mobile_data]
    }
    
    return response

# # update or add new company address--------
# @frappe.whitelist(allow_guest=True)
# def create_or_update_company_address(address, email, website, mobile_number):
#     try:
#         # Try to find existing company address document
#         company_address = frappe.get_all('Company Address', limit=1)
        
#         # If address exists, update it
#         if company_address:
#             company_address_doc = frappe.get_all('Company Address')
#             company_address_doc.address = address
#             company_address_doc.website = website
#             company_address_doc.email = email
#             # Check if the mobile number exists in the child table
#             existing_mobile = [child for child in company_address_doc.company_mobile_child if child.mobile_number == mobile_number]
            
#             if not existing_mobile:
#                 # If the mobile number does not exist, append a new child table row
#                 company_address_doc.append("mobile", {
#                 "doctype": "Company Mobile Child",
#                 'mobile_number': mobile_number
#             })

            
#             # Save the document with updated child table
#             company_address_doc.save()
#             return {'status': 'success', 'message': 'Company Address updated successfully.'}
        
#         # If no address found, create a new document
#         else:
#             new_address_doc = frappe.get_doc({
#                 'doctype': 'Company Address',
#                 'address': address,
#                 'email': email,
#                 'website': website
#             })
            
#             # Add a new mobile number to the child table
#             new_address_doc.append("mobile", {
#                 "doctype": "Company Mobile Child",
#                 'mobile_number': mobile_number
#             })
#             new_address_doc.insert()
#             return {'status': 'success', 'message': 'Company Address created successfully.'}

#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "create_or_update_company_address")
#         return {'status': 'error', 'message': f'An error occurred: {str(e)}'}



# @frappe.whitelist(allow_guest=True)
# def add_or_update_company_address(address, email, website, mobile_numbers):
#     try:
#         # Check if the company address already exists (Assuming it's a single doctype)
#         company_address_doc = frappe.db.get_single_value("Company Address", "address")

#         if company_address_doc:
#             # If the company address exists, fetch the document
#             company_address_doc = frappe.get_doc("Company Address", company_address_doc)
#             company_address_doc.address = address
#             company_address_doc.email = email
#             company_address_doc.website = website
            
#             # Update child table (Company Mobile Child)
#             for mobile in mobile_numbers:
#                 # Check if this mobile number already exists
#                 existing_mobile = frappe.get_all("Company Mobile Child", filters={"parent": company_address_doc.name, "mobile_number": mobile})
                
#                 if not existing_mobile:
#                     company_address_doc.append("mobile", {"mobile_number": mobile})

#             company_address_doc.save(ignore_permissions=True)

#             return {'status': 'success', 'message': 'Company Address updated successfully.'}

#         else:
#             # If no document exists, create a new one
#             new_address_doc = frappe.get_doc({
#                 'doctype': 'Company Address',
#                 'address': address,
#                 'email': email,
#                 'website': website
#             })

#             # Add mobile numbers to the child table
#             for mobile in mobile_numbers:
#                 new_address_doc.append("mobile", {"mobile_number": mobile})

#             new_address_doc.insert(ignore_permissions=True)

#             return {'status': 'success', 'message': 'Company Address created successfully.'}

#     except Exception as e:
#         # Log error for debugging
#         frappe.log_error(frappe.get_traceback(), "add_or_update_company_address")
#         return {'status': 'error', 'message': f'An error occurred: {str(e)}'}
@frappe.whitelist(allow_guest=True)
def add_or_update_company_address(address, email, website, mobile_numbers):
    try:
        # Check if the company address already exists (Assuming it's a single doctype)
        company_address_doc = frappe.db.get_single_value("Company Address", "address")

        if company_address_doc:
            # If the company address exists, fetch the document
            company_address_doc = frappe.get_doc("Company Address", company_address_doc)
            company_address_doc.address = address
            company_address_doc.email = email
            company_address_doc.website = website

            # Filter out mobile numbers that are not 10 digits
            valid_mobiles = [mobile for mobile in mobile_numbers if len(mobile) == 10]

            if valid_mobiles:
                # Check if any mobile numbers are already in the child table
                existing_mobiles = [entry.mobile_number for entry in company_address_doc.mobile]

                # Filter out already existing mobile numbers
                new_mobiles = [mobile for mobile in valid_mobiles if mobile not in existing_mobiles]

                if new_mobiles:
                    # Combine all the valid new mobile numbers into a single entry in the child table
                    mobile_entry = {"mobile_number": ", ".join(new_mobiles)}
                    company_address_doc.append("mobile", mobile_entry)

            company_address_doc.save(ignore_permissions=True)

            return {'status': 'success', 'message': 'Company Address updated successfully.'}

        else:
            # If no document exists, create a new one
            new_address_doc = frappe.get_doc({
                'doctype': 'Company Address',
                'address': address,
                'email': email,
                'website': website
            })

            # Filter out mobile numbers that are not 10 digits
            valid_mobiles = [mobile for mobile in mobile_numbers if len(mobile) == 10]

            if valid_mobiles:
                # Add the valid mobile numbers to the child table as a single entry
                mobile_entry = {"mobile_number": ", ".join(valid_mobiles)}
                new_address_doc.append("mobile", mobile_entry)

            new_address_doc.insert(ignore_permissions=True)

            return {'status': 'success', 'message': 'Company Address created successfully.'}

    except Exception as e:
        # Log error for debugging
        frappe.log_error(frappe.get_traceback(), "add_or_update_company_address")
        return {'status': 'error', 'message': f'An error occurred: {str(e)}'}
