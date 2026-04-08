import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#0f766e" },
        secondary: { main: "#14532d" },
        background: {
            default: "#f4f8f7",
            paper: "#ffffff"
        },
        text: {
            primary: "#0f172a",
            secondary: "#475569"
        }
    },
    shape: {
        borderRadius: 2
    },
    typography: {
        fontFamily: '"Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif',
        h1: { fontWeight: 900 },
        h2: { fontWeight: 900 },
        h3: { fontWeight: 800 },
        h4: { fontWeight: 800 },
        h5: { fontWeight: 800 },
        h6: { fontWeight: 800 },
        button: {
            textTransform: "none",
            fontWeight: 700
        }
    },
    components: {
        MuiButton: {
            defaultProps: {
                disableElevation: true
            },
            styleOverrides: {
                root: {
                    borderRadius: 2
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 2,
                    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
                    backgroundImage: "none"
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 2
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 2
                }
            }
        },
        MuiTextField: {
            defaultProps: {
                variant: "outlined"
            }
        }
    }
});

export default theme;
