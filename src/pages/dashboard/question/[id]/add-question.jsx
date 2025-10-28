import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import axios from "axios";
import { toast } from "react-toastify";

const AddQuestionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const mode = location.state?.mode || "add"; // add | view
  const isViewMode = mode === "view";

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    paperType: "N/A",
  });

  // Fetch existing question if in view mode
  useEffect(() => {
    if (isViewMode && id) {
      axios
        .get(`${import.meta.env.VITE_APP_BASE_URL}/questions/${id}`, {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          const data = res.data?.data || {}; 
          setFormData({
            question: data.question || "",
            answer: data.answer || "",
            paperType: data.paperType || "N/A",
          });
        })
        .catch(() => toast.error("Failed to fetch question details"));
    }
  }, [id, isViewMode]);

  const handleInputChange = (e) => {
    if (isViewMode) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/questions/create`,
        formData,
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Question added successfully!");
      navigate("/questions-listing");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add question");
    }
  };


  return (
    <div>
      <Card title={isViewMode ? "View Question" : "Add Question"}>
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Question */}
          <div>
            <label className="block text-sm font-medium mb-1">Question</label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              className={`border p-2 w-full h-20 rounded ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              readOnly={isViewMode}
            />
          </div>

          {/* Answer */}
          <div>
            <label className="block text-sm font-medium mb-1">Answer</label>
            <textarea
              name="answer"
              value={formData.answer}
              onChange={handleInputChange}
              className={`border p-2 w-full h-20 rounded ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              readOnly={isViewMode}
            />
          </div>

          {/* Paper Type Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">Paper Type</label>
            <select
              name="paperType"
              value={formData.paperType}
              onChange={handleInputChange}
              className={`border p-2 w-full rounded ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              disabled={isViewMode}
            >
              <option value="N/A">N/A</option>
              <option value="Paper1">Paper 1</option>
              <option value="Paper2">Paper 2</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              text={mode === "view"?  "Back" : "Cancel"}
              className={mode === "view"?  "btn-primary" : "btn-light"}
              type="button"
              onClick={() => navigate("/questions-listing")}
            />
            {!isViewMode && (
              <Button text="Add Question" className="btn-primary" type="submit" />
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddQuestionsPage;
