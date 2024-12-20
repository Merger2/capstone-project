import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { quizData as initialQuizData } from "../../assets/data/data.json";
import "./Admin.css";

const Admin_EditQuiz = () => {
    const [loading, setLoading] = useState(true);
    const [quizData, setQuizData] = useState(initialQuizData);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [searchParams] = useSearchParams();
    const title = searchParams.get("title");
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      title: "",
      questions: [],
    });
    const [currentPage, setCurrentPage] = useState(1);
    const questionsPerPage = 1;
    const questionsPerPageGroup = 10;
  
    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
  
      return () => clearTimeout(timer);
    }, []);
  
    useEffect(() => {
      const selectedQuiz = initialQuizData.find((quiz) => quiz.title === title);
      if (selectedQuiz) {
        setEditingQuiz(selectedQuiz);
        setFormData({
          title: selectedQuiz.title,
          questions: selectedQuiz.questions,
        });
      }
    }, [title]);
  
    const handleChange = (e, index, optionKey) => {
      const { name, value } = e.target;
      setFormData((prevData) => {
        const updatedQuestions = [...prevData.questions];
        if (name === "question") {
          updatedQuestions[index].question = value;
        } else if (name.startsWith("option")) {
          updatedQuestions[index].options[optionKey] = value;
        } else if (name === "correctAnswer") {
          updatedQuestions[index].correctAnswer = value;
        }
        return { ...prevData, questions: updatedQuestions };
      });
    };
  
    const handleNumberOfQuestionsChange = (e) => {
      const numQuestions = parseInt(e.target.value, 10);
      if (numQuestions >= 0) {
        setFormData((prevData) => {
          const questions = [...prevData.questions];
          if (numQuestions > questions.length) {
            for (let i = questions.length; i < numQuestions; i++) {
              questions.push({
                question: "",
                options: {
                  a: "",
                  b: "",
                  c: "",
                  d: "",
                },
                correctAnswer: "",
              });
            }
          } else {
            questions.length = numQuestions;
          }
          return { ...prevData, questions };
        });
      }
    };
  
    const handleRemoveQuestion = (index) => {
      setFormData((prevData) => {
        const updatedQuestions = prevData.questions.filter((_, i) => i !== index);
        return { ...prevData, questions: updatedQuestions };
      });
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.title && formData.questions.length > 0) {
        const updatedData = quizData.map((quiz) =>
          quiz.title === editingQuiz.title ? formData : quiz
        );
        setQuizData(updatedData);
        alert(`Kuis "${formData.title}" telah diperbarui.`);
        navigate("/admin/setting_quiz/list");
      } else {
        alert("Judul dan jumlah soal tidak boleh kosong.");
      }
    };
  
    const totalPages = Math.ceil(formData.questions.length / questionsPerPage);
  
    const pageGroups = [];
    for (let i = 1; i <= totalPages; i += questionsPerPageGroup) {
      pageGroups.push(
        Array.from({ length: questionsPerPageGroup }, (_, j) => i + j).filter(
          (page) => page <= totalPages
        )
      );
    }
  
    const indexOfLastQuestion = currentPage * questionsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
    const currentQuestions = formData.questions.slice(
      indexOfFirstQuestion,
      indexOfLastQuestion
    );
  
    const handlePageClick = (pageNumber) => {
      setCurrentPage(pageNumber);
    };
  
    if (!editingQuiz && !loading) {
      return <p>Kuis tidak ditemukan.</p>;
    }
  
    return (
      <div className="pages-container">
        <div className="lms-container">
          <h2 className="section-title">Edit Kuis</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="title">Judul Kuis</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
  
            <div className="form-group">
              <label htmlFor="questions">Jumlah Soal</label>
              <input
                type="number"
                id="questions"
                name="questions"
                value={formData.questions.length}
                onChange={handleNumberOfQuestionsChange}
                min="0"
              />
            </div>
  
            {currentQuestions.map((question, index) => (
              <div key={index} className="question-container">
                <div className="form-group">
                  <label>Soal {index + 1 + indexOfFirstQuestion}</label>
                  <textarea
                    name="question"
                    value={question.question}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>
  
                {Object.keys(question.options).map((optionKey) => (
                  <div key={optionKey} className="form-group">
                    <label>Jawaban {optionKey.toUpperCase()}</label>
                    <input
                      type="text"
                      name={`option-${optionKey}`}
                      value={question.options[optionKey]}
                      onChange={(e) => handleChange(e, index, optionKey)}
                    />
                  </div>
                ))}
  
                <div className="form-group">
                  <label>Jawaban Benar</label>
                  <select
                    name="correctAnswer"
                    value={question.correctAnswer}
                    onChange={(e) => handleChange(e, index)}
                  >
                    <option value="" disabled>
                      Pilih Jawaban Benar
                    </option>
                    {["a", "b", "c", "d"].map((optionKey) => (
                      <option key={optionKey} value={optionKey}>
                        {optionKey.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
  
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(index)}
                  className="button cancel"
                >
                  Hapus Soal No {index + 1 + indexOfFirstQuestion}
                </button>
              </div>
            ))}
  
            {pageGroups.map((group, index) => (
              <div key={index} className="pagination-group">
                {group.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => handlePageClick(pageNumber)}
                    className={`page-button ${
                      currentPage === pageNumber ? "active" : ""
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
            ))}
  
            <button type="submit" className="submit button">
              Simpan
            </button>
          </form>
        </div>
      </div>
    );
  };
  
  export default Admin_EditQuiz;