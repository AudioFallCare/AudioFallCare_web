import React from "react";
import DaumPostcode from "react-daum-postcode";

const AddressSearch = ({ onSelect }) => {
  const handleComplete = (data) => {
    const zipcode = data.zonecode;       // 우편번호
    const address = data.roadAddress;    // 도로명 주소

    onSelect({ zipcode, address });
  };

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <DaumPostcode
        onComplete={handleComplete}
        autoClose
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default AddressSearch;
