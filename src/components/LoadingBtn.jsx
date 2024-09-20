import React from "react";

function LoadingBtn({ name, color }) {
  return (
    <button className={`btn btn-${color}`} type="button" disabled>
      <span
        className="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      ></span>
      {name}...
    </button>
  );
}

export default LoadingBtn;
