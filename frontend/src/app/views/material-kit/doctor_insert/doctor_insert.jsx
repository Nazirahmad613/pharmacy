import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainLayoutdoc from "../../../../components/MainLayoutdoc";
 

 

const DoctorForm = () => {
    const [formData, setFormData] = useState({
        doc_name: "",
        doc_last_name: "",
        doc_section: "",
        doc_phone: "",
        doc_image: null,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, doc_image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    // ⭐ FormData درست
    const formDataToSend = new FormData();
    for (let key in formData) {
        formDataToSend.append(key, formData[key]);
    }

    try {
        const response = await fetch("http://localhost:8000/api/doctors", {
            method: "POST",
            headers: {
                // ❌ Content-Type حذف شد
                "Accept": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`, // ✅
            },
            body: formDataToSend // ⭐ به‌جای JSON.stringify
        });

        if (!response.ok) {
            throw new Error("FAILED");
        }

        toast.success("✅ معلومات داکتر با موفقیت ثبت شد!", {
            position: "top-right",
            autoClose: 3000,
            theme: "dark",
        });

        setFormData({
            doc_name: "",
            doc_last_name: "",
            doc_section: "",
            doc_phone: "",
            doc_image: null,
        });

        document.querySelector("input[type=file]").value = "";

    } catch (error) {
        toast.error("❌ خطا در ثبت اطلاعات داکتر!");
    }
};

    return (
        <MainLayoutdoc>
      
        <div className="custom-form">
            <div className="form-wrapper">
                <div className="form-container">
                    <h2 align="center">فرم ثبت معلومات داکتر</h2>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <label htmlFor="doc_name">نام داکتر:</label>
                        <input
                            type="text"
                            id="doc_name"
                            name="doc_name"
                            value={formData.doc_name}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="doc_last_name">تخلص:</label>
                        <input
                            type="text"
                            id="doc_last_name"
                            name="doc_last_name"
                            value={formData.doc_last_name}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="doc_section">بخش مربوطه:</label>
                        <input
                            type="text"
                            id="doc_section"
                            name="doc_section"
                            value={formData.doc_section}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="doc_phone">شماره تماس:</label>
                        <input
                            type="number"
                            id="doc_phone"
                            name="doc_phone"
                            value={formData.doc_phone}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="doc_image">تصویر داکتر:</label>
                        <input
                            type="file"
                            id="doc_image"
                            name="doc_image"
                            onChange={handleFileChange}
                            accept="image/*"
                        />

                        <button type="submit">ثبت</button>
                    </form>
                </div>
            </div>
        </div>
       
        </MainLayoutdoc>
    );
};

export default DoctorForm;
