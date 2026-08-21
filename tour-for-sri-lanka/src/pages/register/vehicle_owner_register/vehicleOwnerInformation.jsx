import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { useEffect, useMemo, useState, Fragment } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";

export default function VehicleOwnerInformation() {
    const navigate = useNavigate();

    const [err, setErr] = useState("");
    const [vehicleType, setVehicleType] = useState(null);
    const [vehicleBrand, setVehicleBrand] = useState(null);
    const [vehicleModel, setVehicleModel] = useState(null);
    const [shortDescription, setShortDescription] = useState("");
    const [registrationNo, setRegistrationNo] = useState("");
    const [manufactureYear, setManufactureYear] = useState(null);
    const [chassisNumber, setChassisNumber] = useState("");
    const [vehicleColor, setVehicleColor] = useState(null);
    const [ratePerKm, setRatePerKm] = useState("");

    const registrationNoRegex =
        /^([A-Za-z]{1,3}[\s-]?\d{1,4}|\d{1,3}[\s-]\d{4})$/;

    const chassisNumberRegex =
        /^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9-]{5,17}$/;

    const years = Array.from({ length: 50 }, (_, i) => {
        const year = new Date().getFullYear() - i;

        return {
            value: year,
            label: year.toString(),
        };
    });

    const vehicleColors = [
        { value: "white", label: "White" },
        { value: "black", label: "Black" },
        { value: "silver", label: "Silver" },
        { value: "gray", label: "Gray" },
        { value: "blue", label: "Blue" },
        { value: "red", label: "Red" },
        { value: "green", label: "Green" },
        { value: "yellow", label: "Yellow" },
        { value: "orange", label: "Orange" },
        { value: "brown", label: "Brown" },
        { value: "gold", label: "Gold" },
        { value: "beige", label: "Beige" },
        { value: "purple", label: "Purple" },
        { value: "pink", label: "Pink" },
        { value: "maroon", label: "Maroon" },
        { value: "other", label: "Other" },
    ];

    const vehicleTypes = [
        { value: "car", label: "Car" },
        { value: "van", label: "Van" },
        { value: "bus", label: "Bus" },
        { value: "jeep", label: "Jeep" },
    ];

    const vehicleBrands = {
        car: [
            { value: "toyota", label: "Toyota" },
            { value: "nissan", label: "Nissan" },
            { value: "suzuki", label: "Suzuki" },
            { value: "mitsubishi", label: "Mitsubishi" },
            { value: "hyundai", label: "Hyundai" },
            { value: "honda", label: "Honda" },
            { value: "mazda", label: "Mazda" },
            { value: "kia", label: "Kia" },
            { value: "isuzu", label: "Isuzu" },
            { value: "bmw", label: "BMW" },
            { value: "mercedes_benz", label: "Mercedes-Benz" },
            { value: "audi", label: "Audi" },
        ],

        van: [
            { value: "toyota", label: "Toyota" },
            { value: "nissan", label: "Nissan" },
            { value: "hyundai", label: "Hyundai" },
            { value: "mitsubishi", label: "Mitsubishi" },
            { value: "kia", label: "Kia" },
            { value: "ford", label: "Ford" },
        ],

        bus: [
            { value: "toyota", label: "Toyota" },
            { value: "mitsubishi", label: "Mitsubishi" },
            { value: "isuzu", label: "Isuzu" },
            { value: "ashok_leyland", label: "Ashok Leyland" },
            { value: "tata", label: "Tata" },
            { value: "hino", label: "Hino" },
            { value: "yutong", label: "Yutong" },
        ],

        jeep: [
            { value: "toyota", label: "Toyota" },
            { value: "mitsubishi", label: "Mitsubishi" },
            { value: "jeep", label: "Jeep" },
            { value: "land_rover", label: "Land Rover" },
            { value: "ford", label: "Ford" },
            { value: "mahindra", label: "Mahindra" },
            { value: "nissan", label: "Nissan" },
            { value: "suzuki", label: "Suzuki" },
        ],
    };

    const vehicleModels = {
        car: {
            toyota: ["Corolla", "Prius", "Axio", "Alilion", "Vitz"],
            nissan: ["Sunny", "X-Trail", "March", "Note"],
            suzuki: ["Swift", "Alto", "Wagon R"],
            mitsubishi: ["Lancer", "Pajero"],
            hyundai: ["Elantra", "i10"],
            honda: ["Civic", "Fit"],
            mazda: ["Axela", "Demio"],
            kia: ["Picanto", "Sportage"],
            isuzu: ["D-Max"],
            bmw: ["X5", "X3"],
            mercedes_benz: ["C-Class", "E-Class"],
            audi: ["A4", "Q5"],
        },

        van: {
            toyota: ["Hiace", "KDH", "Regius Ace"],
            nissan: ["Caravan", "NV350"],
            hyundai: ["H-1", "Staria"],
            mitsubishi: ["L300", "Delica"],
            kia: ["Pregio"],
            ford: ["Transit"],
        },

        bus: {
            toyota: ["Coaster"],
            mitsubishi: ["Rosa"],
            isuzu: ["Elf Bus", "Journey"],
            ashok_leyland: ["Falcon"],
            tata: ["LP Bus"],
            hino: ["Melpha"],
            yutong: ["ZK6122"],
        },

        jeep: {
            toyota: ["Prado", "Land Cruiser", "Fortuner"],
            mitsubishi: ["Pajero"],
            jeep: ["Wrangler"],
            land_rover: ["Defender", "Discovery"],
            ford: ["Everest"],
            mahindra: ["Thar"],
            nissan: ["Patrol"],
            suzuki: ["Jimny"],
        },
    };

    const suggestedRates = {
        car: { min: 80, max: 200 },
        van: { min: 150, max: 350 },
        jeep: { min: 150, max: 350 },
        bus: { min: 300, max: 700 },
    };

    const selectStyles = {
        control: (base) => ({
            ...base,
            width: "100%",
            minHeight: "50px",
            borderRadius: "20px",
            backgroundColor: "#4A5C6A80",
            border: "none",
            boxShadow: "none",
        }),

        menu: (base) => ({
            ...base,
            backgroundColor: "#4A5C6A",
        }),

        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
                ? "#00C896"
                : "#4A5C6A",
            color: "#CCD0CF",
            cursor: "pointer",
        }),

        singleValue: (base) => ({
            ...base,
            color: "#CCD0CF",
            paddingLeft: "10px",
        }),

        placeholder: (base) => ({
            ...base,
            color: "#CCD0CF",
            opacity: 0.5,
            paddingLeft: "10px",
        }),

        input: (base) => ({
            ...base,
            color: "#CCD0CF",
        }),
    };

    const brandOptions = useMemo(() => {
        return vehicleType
            ? vehicleBrands[vehicleType.value] || []
            : [];
    }, [vehicleType]);

    const modelOptions = useMemo(() => {
        if (!vehicleType || !vehicleBrand) {
            return [];
        }

        const models =
            vehicleModels[vehicleType.value]?.[vehicleBrand.value] ||
            [];

        return models.map((model) => ({
            value: model,
            label: model,
        }));
    }, [vehicleType, vehicleBrand]);

    const steps = [
        {
            label: "Account",
            done: true,
        },
        {
            label: "Vehicle Information",
            done: true,
            number: "2",
        },
        {
            label: "Facilities",
            number: "3",
        },
        {
            label: "Verification",
            number: "4",
        },
    ];

    useEffect(() => {
        const saved = sessionStorage.getItem(
            "VehicleOwnerRegister"
        );

        if (!saved) {
            return;
        }

        try {
            const data = JSON.parse(saved);

            setVehicleType(data.vehicleType || null);
            setVehicleBrand(data.vehicleBrand || null);
            setVehicleModel(data.vehicleModel || null);
            setShortDescription(data.shortDescription || "");
            setRegistrationNo(data.registrationNo || "");
            setManufactureYear(data.manufactureYear || null);
            setChassisNumber(data.chassisNumber || "");
            setVehicleColor(data.vehicleColor || null);
            setRatePerKm(data.ratePerKm || "");
        } catch {
            sessionStorage.removeItem("VehicleOwnerRegister");
        }
    }, []);

    const saveFormData = () => {
        const oldData =
            JSON.parse(
                sessionStorage.getItem("VehicleOwnerRegister")
            ) || {};

        const formData = {
            ...oldData,
            vehicleType,
            vehicleBrand,
            vehicleModel,
            shortDescription,
            registrationNo,
            manufactureYear,
            chassisNumber,
            vehicleColor,
            ratePerKm,
        };

        sessionStorage.setItem(
            "VehicleOwnerRegister",
            JSON.stringify(formData)
        );
    };

    const handlePrevious = () => {
        saveFormData();
        navigate(-1);
    };

    const handleNext = () => {
        if (
            !vehicleType ||
            !vehicleBrand ||
            !vehicleModel ||
            !shortDescription ||
            !registrationNo ||
            !manufactureYear ||
            !chassisNumber ||
            !vehicleColor ||
            !ratePerKm
        ) {
            setErr("Please fill all required fields");
            return;
        }

        if (!registrationNoRegex.test(registrationNo)) {
            setErr(
                "Please enter a valid vehicle registration number"
            );
            return;
        }

        if (!chassisNumberRegex.test(chassisNumber)) {
            setErr("Please enter a valid chassis number");
            return;
        }

        if (Number(ratePerKm) < 1) {
            setErr("Please enter a valid rate per km");
            return;
        }

        setErr("");
        saveFormData();
        navigate("/vehiclefacilities");
    };

    return (
        <div className="relative w-full min-h-screen bg-gradient-to-r from-[#06141B] to-[#253745] overflow-x-hidden flex flex-col">
            <div className="w-full flex justify-center lg:justify-start px-4 sm:px-6 lg:pl-[50px] pt-6 sm:pt-8 lg:pt-[50px] shrink-0">
                <div className="w-[260px] sm:w-[380px] lg:w-[560px] flex items-start">
                    {steps.map((step, i) => (
                        <Fragment key={step.label}>
                            <div className="flex flex-col items-center w-[40px] sm:w-[58px] lg:w-[80px] shrink-0">
                                <div
                                    className={`w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] lg:w-[30px] lg:h-[30px] rounded-full flex items-center justify-center shrink-0 ${
                                        step.done
                                            ? "bg-[#00C896]/80"
                                            : "bg-[#4A5C6A]/80"
                                    }`}
                                >
                                    <span className="text-[#CCD0CF] text-[7px] sm:text-[9px] lg:text-[12px]">
                                        {step.done ? (
                                            <FaCheck />
                                        ) : (
                                            step.number
                                        )}
                                    </span>
                                </div>

                                <span className="mt-1 text-[#CCD0CF] text-[6px] sm:text-[8px] lg:text-[12px] text-center leading-tight whitespace-nowrap">
                                    {step.label}
                                </span>
                            </div>

                            {i < steps.length - 1 && (
                                <div className="flex-1 mt-[9px] sm:mt-[11px] lg:mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50 mx-1"></div>
                            )}
                        </Fragment>
                    ))}
                </div>
            </div>

            <div className="flex-1 w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-8 px-4 sm:px-6 lg:pl-[80px] lg:pr-[8%] py-8">
                <img
                    src="/main_logo.png"
                    alt="Tours for Sri Lanka"
                    className="w-[220px] xs:w-[260px] sm:w-[340px] md:w-[380px] lg:w-[500px] xl:w-[550px] shrink-0 object-contain animate-logo"
                />

                <div className="w-full max-w-[500px] bg-[#253745] text-[#CCD0CF] rounded-[20px] flex flex-col items-center py-[20px] sm:py-[30px] px-4 sm:px-8">
                    <h1 className="text-[20px] xs:text-[22px] sm:text-[25px] font-bold text-[#CCD0CF] text-center">
                        Sign up as a Vehicle Owner
                    </h1>

                    {err && (
                        <div className="text-[#9E4444] text-[12px] text-center mt-[5px]">
                            {err}
                        </div>
                    )}

                    <div className="mt-[20px] w-full text-[12px]">
                        <Select
                            options={vehicleTypes}
                            value={vehicleType}
                            onChange={(selected) => {
                                setVehicleType(selected);
                                setVehicleBrand(null);
                                setVehicleModel(null);
                                setManufactureYear(null);
                            }}
                            placeholder="Vehicle Type"
                            menuPosition="fixed"
                            styles={selectStyles}
                        />
                    </div>

                    <div className="w-full mt-[10px] grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[12px]">
                        <Select
                            options={brandOptions}
                            value={vehicleBrand}
                            onChange={(selected) => {
                                setVehicleBrand(selected);
                                setVehicleModel(null);
                                setManufactureYear(null);
                            }}
                            placeholder="Vehicle Brand"
                            isDisabled={!vehicleType}
                            menuPosition="fixed"
                            styles={selectStyles}
                        />

                        <Select
                            options={modelOptions}
                            value={vehicleModel}
                            onChange={(selected) => {
                                setVehicleModel(selected);
                                setManufactureYear(null);
                            }}
                            placeholder="Vehicle Model"
                            isDisabled={!vehicleBrand}
                            menuPosition="fixed"
                            styles={selectStyles}
                        />
                    </div>

                    <div className="mt-[10px] w-full">
                        <div className="relative w-full">
                            <textarea
                                placeholder="Short description"
                                value={shortDescription}
                                maxLength={200}
                                onChange={(e) =>
                                    setShortDescription(
                                        e.target.value
                                    )
                                }
                                className="resize-none overflow-hidden w-full h-[100px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] pt-[10px] pr-[20px]"
                            />

                            <div className="text-[10px] text-[#CCD0CF]/60 w-full bottom-3 right-3 flex justify-end absolute pr-[10px]">
                                {shortDescription.length} / 200
                            </div>
                        </div>
                    </div>

                    <div className="mt-[10px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[12px]">
                        <input
                            placeholder="Registration No"
                            value={registrationNo}
                            onChange={(e) =>
                                setRegistrationNo(
                                    e.target.value
                                        .replace(
                                            /[^a-zA-Z0-9\s-]/g,
                                            ""
                                        )
                                        .toUpperCase()
                                )
                            }
                            className="w-full h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"
                        />

                        <Select
                            options={years}
                            value={manufactureYear}
                            onChange={setManufactureYear}
                            placeholder="Manufacture Year"
                            isDisabled={!vehicleModel}
                            menuPosition="fixed"
                            styles={selectStyles}
                        />
                    </div>

                    <div className="mt-[10px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[12px]">
                        <input
                            placeholder="Chassis Number"
                            value={chassisNumber}
                            onChange={(e) =>
                                setChassisNumber(
                                    e.target.value
                                        .replace(
                                            /[^a-zA-Z0-9-]/g,
                                            ""
                                        )
                                        .slice(0, 17)
                                        .toUpperCase()
                                )
                            }
                            className="w-full h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"
                        />

                        <Select
                            options={vehicleColors}
                            value={vehicleColor}
                            onChange={setVehicleColor}
                            placeholder="Vehicle Color"
                            isDisabled={!vehicleType}
                            menuPosition="fixed"
                            styles={selectStyles}
                        />
                    </div>

                    <div className="mt-[10px] w-full">
                        <input
                            type="number"
                            min="1"
                            placeholder="Rate per KM (Rs.)"
                            value={ratePerKm}
                            onChange={(e) =>
                                setRatePerKm(e.target.value)
                            }
                            className="w-full h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        {vehicleType &&
                            suggestedRates[vehicleType.value] && (
                                <p className="text-[10px] text-[#CCD0CF]/60 mt-1 pl-[10px]">
                                    Suggested range for{" "}
                                    {vehicleType.label}: Rs.{" "}
                                    {
                                        suggestedRates[
                                            vehicleType.value
                                        ].min
                                    }{" "}
                                    -{" "}
                                    {
                                        suggestedRates[
                                            vehicleType.value
                                        ].max
                                    }{" "}
                                    per km
                                </p>
                            )}
                    </div>

                    <div className="mt-[20px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <button
                            onClick={handlePrevious}
                            className="w-full h-[50px] bg-[#4A5C6A]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#4A5C6A]/80 transition-all duration-300 hover:scale-95 cursor-pointer"
                        >
                            <GrFormPreviousLink className="font-bold text-[20px]" />
                            Previous
                        </button>

                        <button
                            onClick={handleNext}
                            className="w-full h-[50px] bg-[#00C896]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#00C896]/80 transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                            Next
                            <GrFormNextLink className="font-bold text-[20px]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}