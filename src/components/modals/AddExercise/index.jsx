import React, { useState } from "react";
import Select from "react-select";

// css
import styles from "./AddExercisePop.module.scss";
import { createPortal } from "react-dom";
import AllCateogryPop from "../AllCategoryPop";

const AddExercisePop = ({ exercise, setExercise }) => {
  const [category, setCategory] = useState();
  const options = [
    { value: "weight(lbs)", label: "Weight (lbs)" },
    { value: "reps", label: "Reps" },
    { value: "time(seconds)", label: "Time (seconds)" },
  ];
  const handleExercise = () => {
    setExercise(!exercise);
  };
  const handleCategory = () => {
    setCategory(!category);
  };
  return (
    <>
      {category &&
        createPortal(
          <AllCateogryPop category={category} setCategory={setCategory} />,
          document.body
        )}
      <div
        className={`${styles.AddExercisePop} fixed inset-0 flex items-center justify-center cstmModal`}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className={`${styles.modalDialog} modalDialog p-2 mx-auto rounded-lg z-10 bg-white`}>
          <div className="top flex items-center justify-between gap-2 border-b border-gray-100">
            <p className="m-0 font-semibold text-dark text-base">Add Exercise</p>
            <button
              onClick={handleExercise}
              className="m-0 border-0 p-0 transparent font-semibold text-gray-400 "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M14.34 -0.00195312C17.73 -0.00195312 20 2.37805 20 5.91805V14.089C20 17.619 17.73 19.998 14.34 19.998H5.67C2.28 19.998 0 17.619 0 14.089V5.91805C0 2.37805 2.28 -0.00195312 5.67 -0.00195312H14.34ZM13.01 6.96905C12.67 6.62805 12.12 6.62805 11.77 6.96905L10 8.74805L8.22 6.96905C7.87 6.62805 7.32 6.62805 6.98 6.96905C6.64 7.30905 6.64 7.86905 6.98 8.20805L8.76 9.98905L6.98 11.759C6.64 12.109 6.64 12.659 6.98 12.998C7.15 13.168 7.38 13.259 7.6 13.259C7.83 13.259 8.05 13.168 8.22 12.998L10 11.229L11.78 12.998C11.95 13.179 12.17 13.259 12.39 13.259C12.62 13.259 12.84 13.168 13.01 12.998C13.35 12.659 13.35 12.109 13.01 11.769L11.23 9.98905L13.01 8.20805C13.35 7.86905 13.35 7.30905 13.01 6.96905Z"
                  fill="#EB5757"
                />
              </svg>
            </button>
          </div>
          <div className="modalBody py-2 px-2">
            <div className="inner pt-3">
              <form>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12">
                    <label htmlFor="" className="form-label m-0 pb-1 text-gray-500">
                      Exercise Name
                    </label>
                    <input
                      type="text"
                      placeholder="Split Stance 1-Arm Landmine Press"
                      className="form-control rounded-lg border-gray-300 font-semibold text-xs"
                    />
                  </div>
                  <div className="col-span-12">
                    <label htmlFor="" className="form-label m-0 pb-1 text-gray-500">
                      Exercise Category
                    </label>
                    <div className="iconWithText relative">
                      <input
                        onClick={handleCategory}
                        type="text"
                        placeholder="None"
                        className="form-control rounded-lg border-gray-300 font-semibold text-xs"
                      />
                      {/* <Select isMulti options={options} /> */}
                      <button
                        className="btn flex items-center border-0 px-lg-5 justify-center right-0 absolute icn themeClr font-bold"
                        style={{ background: "#F3FAFA" }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <div className="col-span-12">
                    <label htmlFor="" className="form-label m-0 pb-1 text-gray-500">
                      Video
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=I7J6lHL2-4k&ab_channel=ADAMREES"
                      className="form-control rounded-lg border-gray-300 font-semibold text-xs"
                    />
                  </div>
                  <div className="col-span-12">
                    <div className="flex items-center justify-between">
                      <label htmlFor="" className="form-label m-0 pb-1 text-gray-500">
                        Training Variables
                      </label>
                      <span className="text-red-500">*Max 4 Added</span>
                    </div>
                    {/* <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=I7J6lHL2-4k&ab_channel=ADAMREES"
                      className="form-control rounded-lg border-gray-300 font-semibold text-xs"
                    /> */}
                    <Select isMulti options={options} />
                  </div>
                  <div className="col-span-12">
                    <label htmlFor="" className="form-label m-0 pb-1 text-gray-500">
                      Coaching Cues
                    </label>
                    <div className="flex items-center justify-between gap-1">
                      <input
                        type="text"
                        placeholder="Write.... "
                        className="form-control rounded-lg border-gray-300 font-semibold text-xs"
                      />
                      <button className="btn flex items-center justify-center border bg-transparent text-gray-400">
                        <span className="icn me-1"></span>
                        Add
                      </button>
                    </div>
                  </div>
                  <div className="col-span-12">
                    <label htmlFor="" className="form-label m-0 pb-1 text-gray-500">
                      Coaching Instructions
                    </label>
                    <div className="flex items-center justify-between gap-1">
                      <textarea
                        name=""
                        id=""
                        placeholder="Write....."
                        rows={5}
                        className="form-control rounded-lg border-gray-300 font-semibold text-xs"
                      ></textarea>
                    </div>
                  </div>
                  <div className="col-span-12 text-end">
                    <button
                      onClick={handleExercise}
                      className="btn iniline-flex items-center justify-center commonBtn text-white"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddExercisePop;
