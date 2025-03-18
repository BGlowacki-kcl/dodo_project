import React from "react";

const AssessmentStatus = ({ status, onClick, title }) => {
    const containerStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        color: "white",
    };
    
    const iconStyle = {
        fontSize: "2rem",
        marginBottom: "0.5rem"
    };
    
    const titleStyle = {
        fontSize: "1.5rem",
        textAlign: "center"
    };
    
    const getStatusIcon = () => {
        switch (status) {
            case "completed-full":
                return (
                    <div style={containerStyle} onClick={onClick} title="Completed (Full Marks)">
                        <span style={iconStyle}>✅</span>
                        <span style={titleStyle}>{title}</span>
                    </div>
                );
            case "completed-partial":
                return (
                    <div style={containerStyle} onClick={onClick} title="Completed (Not Full Marks)">
                        <span style={iconStyle}>🟡</span>
                        <span style={titleStyle}>{title}</span>
                    </div>
                );
            case "attempted":
                return (
                    <div style={containerStyle} onClick={onClick} title="Attempted (Not Submitted)">
                        <span style={iconStyle}>📝</span>
                        <span style={titleStyle}>{title}</span>
                    </div>
                );
            case "not-submitted":
            default:
                return (
                    <div style={containerStyle} onClick={onClick} title="Not Submitted">
                        <span style={iconStyle}>🔍</span>
                        <span style={titleStyle}>{title}</span>
                    </div>
                );
        }
    };

    return getStatusIcon();
};

export default AssessmentStatus;