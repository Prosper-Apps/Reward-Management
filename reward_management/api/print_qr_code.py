import frappe
from frappe.utils import now, format_datetime

from frappe.model.document import Document
import requests
from io import BytesIO
from PIL import Image
import hashlib
from datetime import datetime


@frappe.whitelist(allow_guest=True)
def print_qr_code():
    # Fetch fields from the Product QR document
    qr_docs = frappe.get_all("Product QR", fields=["name", "product_name", "quantity"])

    # Fetch child table data linked with qr_table field for each Product QR document
    for qr_doc in qr_docs:
        qr_doc['qr_table_data'] = frappe.get_all("Product QR Table",
                                                 filters={"parent": qr_doc['name']},
                                                 fields=["product_table_name", "qr_code_image", "product_qr_id", "points","generated_date","generated_time","scanned","product_qr_name","carpenter_id","redeem_date"])
        # Format date fields as dd-MM-yyyy
        for qr_data in qr_doc['qr_table_data']:
            if qr_data.get('generated_date'):
                qr_data['generated_date'] = frappe.utils.formatdate(qr_data['generated_date'], 'dd-MM-yyyy')
            if qr_data.get('redeem_date'):
                qr_data['redeem_date'] = frappe.utils.formatdate(qr_data['redeem_date'], 'dd-MM-yyyy')

    return qr_docs



@frappe.whitelist(allow_guest=True)
def create_product_qr(product_name, quantity):
    try:
        # Check if a Product QR document already exists for the given product_name
        existing_product_qr = frappe.db.exists("Product QR", {"product_name": product_name})

        if existing_product_qr:
            # If a document already exists, retrieve it
            product_qr_doc = frappe.get_doc("Product QR", existing_product_qr)
        else:
            # Otherwise, create a new Product QR document
            product_qr_doc = frappe.new_doc("Product QR")
            product_qr_doc.product_name = product_name
            product_qr_doc.quantity = quantity
            product_qr_doc.insert()
            product_qr_doc.reload()

        # Retrieve child table rows
        # child_table_rows = product_qr_doc.get("qr_table") or []

        # Store the current date and time once
        # current_datetime = datetime.now()
        # formatted_date = current_datetime.strftime('%Y-%m-%d')
        # formatted_time = current_datetime.strftime('%H:%M:%S')
        
        # Get the current date and time using frappe.utils.now()
        current_datetime = now()
        current_datetime_obj = datetime.strptime(current_datetime, "%Y-%m-%d %H:%M:%S.%f")

        # Get the timestamp value from the datetime object
        timestamp_value = current_datetime_obj.timestamp()
        current_date = format_datetime(current_datetime, "yyyy-MM-dd") 
        current_time = format_datetime(current_datetime, "HH:mm:ss")
        
        print("\n\n\ncurrent date-----",current_date)
        print("\n\n\ncurrent time-----",current_time)
        print("\n\n\ncurrent datetime-----",current_datetime)

        # Add new rows based on the quantity requested
        for i in range(quantity):
            child_row = product_qr_doc.append("qr_table", {})

            # Generate a unique 8-digit numeric hash value
            # Use the same timestamp for all
            hash_input = f"{timestamp_value}_{product_name}_{i}"  
            # Ensure 8 digits
            product_qr_id = int(hashlib.md5(hash_input.encode()).hexdigest(), 16) % 100000000  
             # Format as 8-digit number
            child_row.product_qr_id = f"{product_qr_id:08d}" 
            # Set product_name directly
            child_row.product_table_name = product_name  
            # Use the stored date
            # child_row.generated_date = formatted_date 
            # # Use the stored time 
            # child_row.generated_time = formatted_time  
            
            child_row.generated_date = current_date  # Use Frappe's current date
            child_row.generated_time = current_time

            # Generate QR code using the API with product_name and product_qr_id concatenated
            qr_content = f"{product_qr_doc.name}_{product_name}_{child_row.product_qr_id}"
            qr_api_url = f"https://api.qrserver.com/v1/create-qr-code/?data={qr_content}&size=100x75"
            response = requests.get(qr_api_url)

            if response.status_code == 200:
                # Save QR code image to File Manager with a file name based on product_name and product_qr_id
                file_name = f"{child_row.product_qr_id}.png"
                qr_image_bytes = BytesIO(response.content)
                qr_image = Image.open(qr_image_bytes)

                # Save the image to File Manager
                file_doc = frappe.get_doc({
                    "doctype": "File",
                    "file_name": file_name,
                    "attached_to_doctype": "Product QR",
                    "attached_to_name": product_qr_doc.name,
                    "file_url": "/files/" + file_name,
                    "content": qr_image_bytes.getvalue(),
                    "is_private": 0  # Set to 1 if you want it private
                })
                file_doc.insert(ignore_permissions=True)

                # Update qr_code_image field in child table row
                child_row.qr_code_image = "/files/" + file_name  # Update with file URL

            else:
                print(f"Failed to generate QR code for 'product_qr_id: {child_row.product_qr_id}'")

            # Set qr_content value into product_qr_name
            child_row.product_qr_name = qr_content

        # Update the quantity field with the new count
        product_qr_doc.quantity = len(product_qr_doc.qr_table)

        # Save the product QR document with all its child rows
        product_qr_doc.save(ignore_permissions=True)
        frappe.db.commit()

        return {
            "success": True,
            "message": f"Product QR created successfully with name: {product_qr_doc.name}"
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "create_product_qr")
        return {
            "success": False,
            "message": str(e)
        }

        
# show qr-code-images------- 
@frappe.whitelist(allow_guest=True)
def print_qr_code_images(product_name):
    try:
        qr_images = []

        # Fetch Product QR documents matching the product_name
        qr_docs = frappe.get_all("Product QR", filters={"product_name": product_name},
                                 fields=["name", "product_name", "quantity"])

        # Fetch child table data linked with qr_table field for each Product QR document
        for qr_doc in qr_docs:
            qr_table_data = frappe.get_all("Product QR Table", filters={"parent": qr_doc['name']},
                                           fields=["product_table_name", "qr_code_image", "product_qr_id", "points"])

            # Append QR code image URLs to qr_images list
            for row in qr_table_data:
                file_url = frappe.utils.get_files_path(row.qr_code_image)  
                qr_images.append({
                    "product_id": qr_doc.get("product_id"),  # Assuming product_id exists in Product QR
                    "qr_code_image": row.qr_code_image
                })

        return qr_images

    except Exception as e:
        frappe.log_error(f"Error fetching QR code images: {e}")
        return []
    


# # count total qr code points-------
# @frappe.whitelist(allow_guest=True)
# def total_points_of_qr_code():
#     # Fetch fields from the Product QR document
#     qr_docs = frappe.get_all("Product QR", fields=["name", "product_name", "quantity"])

#     total_points = 0  # Initialize total points counter

#     # Fetch child table data linked with qr_table field for each Product QR document
#     for qr_doc in qr_docs:
#         qr_doc['qr_table_data'] = frappe.get_all("Product QR Table",
#                                                  filters={"parent": qr_doc['name']},
#                                                  fields=["product_table_name", "qr_code_image", "product_qr_id", "points", "generated_date"])
        
#         # Calculate the total points for this Product QR document
#         for row in qr_doc['qr_table_data']:
#             total_points += row.get('points', 0)

#     # Return the QR docs and total points
#     return {
#         "qr_docs": qr_docs,
#         "total_points": total_points
#     }



@frappe.whitelist(allow_guest=True)
def get_product_by_name(productName):
    if not productName:
        return {"message": "Product name is required."}

    # Fetch Product QR documents by product name
    product_qr_docs = frappe.get_all("Product QR", filters={"product_name": productName}, fields=["name", "product_name"])

    if not product_qr_docs:
        return {"message": "No products found with the given name."}

    # Initialize dictionaries to store counts and data by date and time
    counts_by_date_time = {}
    qr_data_by_date_time = {}

    # Fetch child table data linked with qr_table field for each Product QR document
    for product_qr_doc in product_qr_docs:
        qr_table_data = frappe.get_all("Product QR Table",
                                       filters={"parent": product_qr_doc['name']},
                                       fields=["product_table_name", "qr_code_image", "product_qr_id", "points", "generated_date", "generated_time"],
                                       order_by="generated_date desc")

        # Ensure qr_table_data is populated
        product_qr_doc['qr_table_data'] = qr_table_data

        # Format date fields as dd-MM-yyyy
        for qr_data in qr_table_data:
            if qr_data.get('generated_date'):
                formatted_date = frappe.utils.formatdate(qr_data['generated_date'], 'dd-MM-yyyy')
                
                # Extract hour and minute from generated_time (which is timedelta)
                generated_time = qr_data['generated_time']
                if generated_time:
                    # Calculate total seconds to extract hours and minutes
                    total_seconds = int(generated_time.total_seconds())
                    hours, remainder = divmod(total_seconds, 3600)
                    minutes, _ = divmod(remainder, 60)
                    formatted_time = f"{hours:02}:{minutes:02}"  # Format as HH:MM
                else:
                    continue  # Skip if time is not available

                # Create a combined key for counts based on formatted date and only hour and minute
                date_time_key = f"{formatted_date} {formatted_time}"

                # Count QR codes by generated date and time
                if date_time_key in counts_by_date_time:
                    counts_by_date_time[date_time_key] += 1
                else:
                    counts_by_date_time[date_time_key] = 1

                # Group QR data by generated date and time
                if date_time_key in qr_data_by_date_time:
                    qr_data_by_date_time[date_time_key].append({
                        "product_name": product_qr_doc['product_name'],
                        "qr_code_image": qr_data['qr_code_image'],
                        "points": qr_data['points']
                    })
                else:
                    qr_data_by_date_time[date_time_key] = [{
                        "product_name": product_qr_doc['product_name'],
                        "qr_code_image": qr_data['qr_code_image'],
                        "points": qr_data['points']
                    }]

    # Prepare formatted data with unique date-time keys, total counts, and QR code images
    formatted_data = []
    for date_time_key, qr_data_list in qr_data_by_date_time.items():
        total_count = counts_by_date_time.get(date_time_key, 0)
        formatted_date, formatted_time = date_time_key.split(' ', 1) 
        formatted_data.append({
            "generated_date": formatted_date,
            "generated_time": formatted_time,
            "total_product": total_count,
            "qr_code_images": qr_data_list
        })

    return {"message": formatted_data}




