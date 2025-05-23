import { useState, useRef, useEffect } from "react";
import Pageheader from "../../../components/common/pageheader/pageheader";
import axios from "axios";
import Slider from "react-slick";
import SuccessAlert from '../../../components/ui/alerts/SuccessAlert';
import "../../../assets/css/style.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DangerAlert from '../../../components/ui/alerts/DangerAlert';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const AddLoginInstruction = () => {
  const [instructions, setInstructions] = useState([]);
  // const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  // const sliderRef = useRef(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [fileDetails, setFileDetails] = useState<{ url: string, name: string }[]>([]);
  const [instructionToEdit, setInstructionToEdit] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [imageDescription, setImageDescription] = useState('');
  const [showAddInstructionForm, setShowAddInstructionForm] = useState(false);
  const [imageAddDescription, setImageAddDescription] =  useState<string[]>([]);
  const [deleteType, setDeleteType] = useState<'image' | 'instruction' | null>(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [imageDescriptiontoDelete, setImageDescriptiontoDelete] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState('');
  
  

 const notyf = new Notyf({
    position: {
      x: 'right',
      y: 'top',
    },
    duration: 3000,
  });


  useEffect(() => {
    document.title = 'Instructions';

    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
        // window.location.reload();
      }, 3000);
      return () => clearTimeout(timer);
    }

    const fetchInstructions = async () => {
      try {
        const response = await axios.get(
          "/api/method/reward_management.api.login_instructions.get_instructions"
        );
        if (response && response.data && response.data.message && response.data.message.instructions) {
          setInstructions(response.data.message.instructions);
        } else {
          console.error("Failed to fetch instructions or no data available.");
        }
      } catch (error) {
        console.error("Error fetching instructions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, [showSuccessAlert]);

  

 
  // handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      if (fileArray.length + fileDetails.length > 10) {
        setError('You can only select up to 10 images!');
        return;
      } else {
        setError('');
      }

      const newFileDetails = fileArray.map((file) => {
        const reader = new FileReader();
        return new Promise<{ url: string, name: string }>((resolve) => {
          reader.onload = (event) => {
            resolve({
              url: event.target?.result as string,
              name: file.name,
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newFileDetails).then((newDetails) => {
        setFileDetails((prevFiles) => [...prevFiles, ...newDetails]);
      });
    }
  };

 
  // for uploading file
  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("is_private", "0");
    formData.append("folder", "");
    formData.append("file_name", file.name);

    try {
      const response = await axios.post(`/api/method/upload_file`, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.message?.file_url) {
        return response.data.message.file_url;
      } else {
        console.error("File URL not found in response:", response.data);
        return null;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };



  const handleRemoveImage = (indexToRemove: number) => {
    setFileDetails((prevFiles) =>
        prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

   // Save URL data
   const handleImageDescriptionChange = (index: number, value: string) => {
    const updatedUrls = [...imageAddDescription];
    updatedUrls[index] = value;
    setImageAddDescription(updatedUrls);
    // console.log("Updated URLs:", updatedUrls);
  };



  const handleEditGuide = (instruction: any) => {
    setInstructionToEdit(instruction);
    setImageDescription(instruction.image_description);
    setFileDetails([{ 
      url: instruction.guide_image, 
      name: instruction.guide_image.split('/').pop() 
    }]);
    setShowAddInstructionForm(false);
    // console.log("instruction", instruction);
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!instructionToEdit) {
      notyf.error("No instruction selected for editing");
      return;
    }
  
    try {
      const oldImageUrl = instructionToEdit.guide_image;
      // console.log("Original Image URL:", oldImageUrl);
  
      // Find the newly added file (it will be a data URL)
      const newFileDetail = fileDetails.find(file => 
        file.url.startsWith('data:image') && 
        file.url !== oldImageUrl
      );
  
      let newImageUrl = oldImageUrl;
  
      if (newFileDetail) {
        // console.log("New file detected:", newFileDetail.name);
        
        // Convert data URL to blob and upload
        const response = await fetch(newFileDetail.url);
        const blob = await response.blob();
        const file = new File([blob], newFileDetail.name, { type: blob.type });
        
        // console.log("Uploading new image...");
        newImageUrl = await uploadFile(file);
        
        if (!newImageUrl) {
          notyf.error("Failed to upload new image");
        }
        
      //   console.log("New Image URL after upload:", newImageUrl);
      // } else {
      //   console.log("No image change - keeping original image");
      }
  
      const data = {
        image_url: oldImageUrl, // Original image URL for identification
        new_image_url: newImageUrl,
        new_image_description: imageDescription,
      };
  
      // console.log("Submitting data:", data);
  
      const response = await axios.post(
        '/api/method/reward_management.api.login_instructions.add_update_instructions', 
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
  
      if (response.data.message?.status === 'success') {
        setShowSuccessAlert(true);
        setAlertMessage('Instruction updated successfully!');
        handleCloseModal();
        
        // Refresh the instructions after successful update
        const refreshResponse = await axios.get(
          "/api/method/reward_management.api.login_instructions.get_instructions"
        );
        if (refreshResponse.data.message?.instructions) {
          setInstructions(refreshResponse.data.message.instructions);
        }
      } else {
        notyf.error("Error updating instruction: " + (response.data.message?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error during update:", error);
      notyf.error(`An error occurred while updating the instruction. ${error}`);
    }
  };



  const handleCloseModal = () => {
    setInstructionToEdit(null);
    setInstructionToEdit(false); 
    setShowAddInstructionForm(false);
    setImageDescription('');
    setFileDetails([]);
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  const handleAddNewGuide = () => {
    setInstructionToEdit(null);
    setShowAddInstructionForm(true);
    setImageDescription('');
    setFileDetails([]);
    setImageAddDescription([]);

  };

  const handleAddSubmit = async (event:any) => {
    event.preventDefault(); 
    const uploadedFileURLs = [];


    if(fileDetails.length === 0) {
      notyf.error("Please select at least one image.");
      return;
    }
    if(imageAddDescription.length === 0) {
      notyf.error("Please add description for the image.");
      return;
    }
    if (fileDetails.length !== imageAddDescription.length) {
      notyf.error("Please add description for all images.");
      return;
    }
  
  
    try {
      for (const fileDetail of fileDetails) {
        const fileBlob = await fetch(fileDetail.url).then(res => res.blob());
        const file = new File([fileBlob], fileDetail.name, { type: fileBlob.type });
        const fileURL = await uploadFile(file);
        if (fileURL) {
          uploadedFileURLs.push(fileURL);
        }
      }
      // Get current descriptions
    const currentDescriptions = [...imageAddDescription];

    
  
      const data = {
        new_image_url: uploadedFileURLs,
        image_description: currentDescriptions,
      };
  
      const response = await axios.post('/api/method/reward_management.api.login_instructions.add_new_instruction', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
  
      const result = response.data;
  
      if (result.message && result.message.status === 'success') {
        setShowSuccessAlert(true);
        setAlertMessage('Instructions added successfully!');
        setFileDetails([]); 
        setImageDescription('');
        setShowAddInstructionForm(false); 
      } else {
        notyf.error("Error updating instructions: " + (result.message.message || "Unknown error."));
      }
    } catch (error) {
      console.error("Error during file upload or API call:", error);
      notyf.error("An error occurred. Please try again.");
    }
  };

    // // delete selected slider image-----
    const handleDeleteImage = (index: number) => {
      const selectedImage = instructions[index].guide_image;
      const selectedDescription = instructions[index].image_description;
      // console.log("selectedDescription", selectedDescription)
      // console.log("selectedImage", selectedImage)
    
      setImageToDelete(selectedImage);
      setImageDescriptiontoDelete(selectedDescription);
      setDeleteType('image');  // Set the delete type to 'image'
      setDeleteMessage('Are you sure you want to delete selected image?');
      setIsConfirmDeleteModalOpen(true);
    };
  

  // handle project delete ---------
  const handleDeleteAll = () => {
    setDeleteType('instruction');  // Set the delete type to 'project'
    setDeleteMessage('Are you sure you want to delete this instructions?');
    setIsConfirmDeleteModalOpen(true);
  };


  // confirm delete
  const confirmDelete = async () => {
    if (deleteType === 'image' && imageToDelete) {
      try {
        const response = await axios.post('/api/method/reward_management.api.login_instructions.delete_selected_instruction', {
          image_name: imageToDelete,
          description: imageDescriptiontoDelete
        });

        if (response.data.message?.status === 'success') {
          setImageDescription('');
          setFileDetails(prev => prev.filter(file => file.name !== imageToDelete));
          setImageToDelete(null);
          setImageDescriptiontoDelete(null);
          setIsConfirmDeleteModalOpen(false);
          setShowSuccessAlert(true);
          setAlertMessage('Selected image deleted successfully!');
        } else {
          notyf.error("Failed to delete image: " + response.data.message.message);
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        notyf.error("An error occurred while deleting the image.");
      }
    } else if (deleteType === 'instruction') {
      try {
        const response = await axios.post('/api/method/reward_management.api.login_instructions.delete_all_instructions', {
        });

        if (response.data.message?.status === 'success') {
          setIsConfirmDeleteModalOpen(false);
          setShowSuccessAlert(true);
          setAlertMessage('Instructions deleted successfully!');
        } else {
          notyf.error("Failed to delete instructions: " + response.data.message.message);
        }
      } catch (error) {
        console.error("Error deleting instructions:", error);
        notyf.error("An error occurred while deleting the instructions.");
      }
    }
  };

  const cancelDelete = () => {
    setImageToDelete(null);
    setImageDescriptiontoDelete(null);
    setIsConfirmDeleteModalOpen(false);
  };


  
  return (
    <>
      <Pageheader
        currentpage={"Login Instructions"}
        activepage={"/add-login-instructions"}
        // activepagename="Login Instructions"
      />

      <div className="grid grid-cols-12 gap-x-6 p-6">
      <div className="col-span-12 flex justify-end items-center">
          {/* <h2 className="text-[var(--primaries)] text-xl font-semibold">Projects</h2> */}
          <button
            onClick={handleAddNewGuide}
            className="ti-btn !py-1 !px-2 text-xs !text-white !font-medium bg-[var(--primaries)]"
          >
            Add New Instructions          

          </button>
        </div>
       
        <div className="col-span-12 mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6 ">
           
            <h3 className="text-center text-[var(--primaries)] text-lg font-semibold mb-4">
              Instructions Gallery
            </h3>
          
               {instructions.length === 1 ? (
              // Single instruction display
              <div className="relative">
              
                <div className="absolute top-2 right-2 flex gap-2">
                        <button
                           onClick={() => handleEditGuide(instructions[0])} 
                          className=" text-white  hover:text-black"
                        >
                          <i className="ri-edit-line text-md w-8 h-8 p-2 bg-primary rounded-full hover:bg-primary/20 "></i>
                        </button>
                        <button
                          onClick={() => handleDeleteImage(0)}
                          className="text-white  hover:text-black "
                        >
                          <i className="ri-delete-bin-line text-md w-8 h-8 p-2 bg-primary rounded-full hover:bg-primary/20"></i>
                        </button>
                      </div>

                <img
                  src={`${window.origin}${instructions[0].guide_image}`}
                  alt="Guide"
                  className="w-full h-[500px] rounded-md object-contain"
                />
                <div className="pt-5">
                  <p className="text-center mt-4">{instructions[0].image_description}</p>
                </div>
              </div>
            ) : (
              // Multiple instructions - use Slider
              <Slider
                dots={true}
                infinite={true}
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
                autoplay={true}
                autoplaySpeed={3000}
                pauseOnHover={true}
                arrows={false} >
                {instructions.map((instruction, index) => (
                  <div key={index} className={index === 0 ? "first-slide" : ""}>
                    
                      <div  key={index} className="relative">
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => handleEditGuide(instruction)}
                          className=" text-white  hover:text-black"
                        >
                          <i className="ri-edit-line text-md w-8 h-8 p-2 bg-primary rounded-full hover:bg-primary/20 "></i>
                        </button>
                        <button
                          onClick={() => handleDeleteImage(index)}
                          className="text-white  hover:text-black "
                        >
                          <i className="ri-delete-bin-line text-md w-8 h-8 p-2 bg-primary rounded-full hover:bg-primary/20"></i>
                        </button>
                      </div>
                      <img
                      src={`${window.origin}${instruction.guide_image}`}
                      alt={`Guide ${index + 1}`}
                      className="w-full h-[500px] rounded-md object-contain"
                      />

                    <div className="pt-5">
                      <p className="text-center mt-4">{instruction.image_description}</p>
                    </div>
                    </div>

                     
                   
                    
                  </div>
                ))}
              </Slider>
            )}

                {/* delete slider or add new slider */}
            <div className="flex justify-end mt-4 gap-2">
              
              <button
                onClick={() => handleDeleteAll()}
                className="ti-btn !py-1 !px-2 text-xs text-white !font-medium bg-[var(--primaries)] "
              >
                <i className="ri-delete-bin-line font-bold"></i>
               Delete All Instructions
              </button>

            </div>
        
          </div>
        </div>
      </div>
{/* add login inatructions----- */}
        {showAddInstructionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-defaultborder pb-2 p-4 sticky top-0 bg-white z-10">
              <h6 className="text-primary font-semibold">Add New Instructions </h6>
              <button onClick={handleCloseModal} className="text-defaulttextcolor">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="mt-4">
              <div className="p-4">
                <div>
                  <label
                    htmlFor="file-upload"
                    className="block text-sm text-defaulttextcolor font-semibold"
                  >
                    Image
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="file-upload"
                    className="outline-none focus:outline-none focus:ring-0 no-outline focus:border-[#dadada] mt-1 block w-full p-2 border border-[#dadada] rounded-[5px]"
                    onChange={handleFileChange}
                  />
                  {/* {error && <p className="text-red-500 text-sm mt-1">{error}</p>} */}
                </div>

                <div className="grid grid-cols-1 gap-5 mt-4">
                  {fileDetails.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-28 object-contain aspect-square rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-[0px] right-0 bg-red-600 text-primary p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <i className="ri-close-line text-primary text-lg font-bold"></i>
                      </button>
                      {/* description input for each image */}
                      {/* <label className="block text-sm text-defaulttextcolor font-semibold mt-3">Description</label> */}
                      <label htmlFor="image-description" className="block text-sm text-defaulttextcolor font-semibold">
                  Image Description  </label>
                      <textarea
                        id="image-description"
                        placeholder="Enter description"
                        value={imageAddDescription[index] || ''}
                        onChange={(e) => handleImageDescriptionChange(index, e.target.value)}
                        className="outline-none focus:outline-none focus:ring-0 no-outline focus:border-[#dadada] mt-1 p-2 w-full border border-[#dadada] rounded-md"                        
                        required

                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-defaultborder p-4 items-baseline">
                <button
                  type="submit"
                  className="ti-btn ti-btn-primary-full bg-primary me-2"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="ti-btn ti-btn-success bg-defaulttextcolor ti-btn text-white !font-medium m-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


{/* edit instructions----- */}
        {instructionToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
              <div className="flex justify-between items-center border-b pb-2 p-4">
                <h6 className="text-primary font-semibold">
                  Edit Instructions
                </h6>
                <button onClick={handleCloseModal} className="text-defaulttextcolor">
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="p-4">
                <div>
                  <label htmlFor="file-upload" className="block text-sm text-defaulttextcolor font-semibold">
                    Instruction Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    name="file"
                    multiple
                    id="file-upload"
                    className="outline-none focus:outline-none focus:ring-0 no-outline focus:border-[#dadada] mt-1 block w-full p-2 border border-[#dadada] rounded-md"
                    onChange={handleFileChange}
                  />
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                <div className="grid grid-cols-3 gap-5 mt-4">
                  {fileDetails.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-28 object-contain rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-[-10px] right-[-10px] bg-red-600 text-primary p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <i className="ri-close-line text-primary text-lg font-bold "></i>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="image-description"
                    className="block text-sm text-defaulttextcolor font-semibold"
                  >
                    Image Description
                  </label>
                  <textarea
                    id="image-description"
                    className="outline-none focus:outline-none focus:ring-0 no-outline focus:border-[#dadada] mt-1 p-2 w-full border border-[#dadada] rounded-md"
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                  />
                </div>
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t border-defaultborder p-4">
                  <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-md"
                  >
                    Update Instruction
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-300 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {showSuccessAlert && <SuccessAlert 
      message={alertMessage} 

      onClose={function (): void {
        throw new Error("Function not implemented.");
      } } 
      onCancel={function (): void {
        throw new Error("Function not implemented.");
      } } />}


     {isConfirmDeleteModalOpen && (
        <DangerAlert
          type="danger"
          message={deleteMessage}
          onDismiss={cancelDelete}
          onConfirm={confirmDelete}
          cancelText="Cancel"
          confirmText="Continue"
        />
      )}
    </>
  );
};


export default AddLoginInstruction;
