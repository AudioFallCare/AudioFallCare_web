import DaumPostcode from "react-daum-postcode";

const AddressSearch = ({ onSelect }) => {
  const handleComplete = (data) => {
    onSelect(data.address);
  };

  return <DaumPostcode onComplete={handleComplete} />;
};

export default AddressSearch;
