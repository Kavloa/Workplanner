const Delete_Popup = ({ message, onClose , confirmation }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <p>{message}</p>
          <div className="w-full flex gap-2 justify-end items-end">
          <button
            onClick={confirmation}
            className="mt-4 border-[1px] border-[#c59174] text-[#c59174] py-2 px-4 rounded"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="mt-4 border-[1px] border-blue-500 text-blue-500 py-2 px-4 rounded"
          >
            Close
          </button>
          </div>
        </div>
      </div>
    );
  };
  

  export default Delete_Popup