import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const AddQuestionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.state?.mode || "add"; // add | view | edit
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  });

  const handleInputChange = (e) => {
    if (isViewMode) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isViewMode) return;

    console.log("Form Submitted:", formData);

    // For now just redirect back
    navigate("/questions-listing");
  };

  return (
    <div>
      <Card
        title={
          isViewMode ? "View Question" : isEditMode ? "Edit Question" : "Add Question"
        }
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Question */}
          <div>
            <label className="block text-sm font-medium mb-1">Question</label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              className={`border p-2 w-full h-20 rounded ${
                isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
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
              className={`border p-2 w-full h-20 rounded ${
                isViewMode ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              readOnly={isViewMode}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              text="Cancel"
              className="btn-light"
              type="button"
              onClick={() => navigate("/questions-listing")}
            />
            {!isViewMode && (
              <Button
                text={isEditMode ? "Update Question" : "Add Question"}
                className="btn-primary"
                type="submit"
              />
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddQuestionsPage;
