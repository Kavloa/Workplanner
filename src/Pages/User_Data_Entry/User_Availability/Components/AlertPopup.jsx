const AlertPopup = ({ message, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <p>{message}</p>
          <div className="w-full flex justify-end items-end">
          <button
            onClick={onClose}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          >
            Close
          </button>
          </div>
        </div>
      </div>
    );
  };
  

  export default AlertPopup