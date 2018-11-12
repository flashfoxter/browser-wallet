import { createMuiTheme } from '@material-ui/core/styles';

export const mainBorderRadius = '8px';
export const mainColor = '#009d8b';
export const mainBackgroundColor = 'rgba(0, 0, 0, 0.03)';
export const mainLightTextColor = 'rgba(0, 0, 0, 0.5)';
export const bigElementWidth = '296px';
export const bigElementHeight = '56px';
export const smallElementWidth = '96px';
export const smallElementHeight = '36px';
export const topPanelHeight = '70px';
export const topPanelBackgroundColor = 'rgba(0, 0, 0, 0.05)';


export const theme = createMuiTheme({
    palette: {
        error: {
            main: '#b00020'
        },
        primary: {
            light: 'rgba(0, 0, 0, 0.5)',
            main: '#000000',
            dark: 'rgba(0, 0, 0, 0.5)'
        },
        secondary: {
            light: '#009d8b',
            main: '#009d8b',
            dark: '#26A596'
        },
        text: {
            primary: '#000000',
            secondary: '#000000',
            disabled: 'rgba(0, 0, 0, 0.5)'
        },
        action: {
            hoverOpacity: '0.04'
        }
    },
    typography: {
        useNextVariants: true,
        h6: {
            fontSize: '26px',
            letterSpacing: '0.2px',
            fontWeight: 'bold',
            fontFamily: 'Nexa'
        },
        h5: {
            fontSize: '20px',
            letterSpacing: '0.3px',
            fontWeight: 'normal'
        }
    },
    overrides: {
        // Name of the component ⚛️ / style sheet
        MuiFilledInput: {
            // Name of the rule
            root: {
                backgroundColor: mainBackgroundColor,
                width: bigElementWidth,
                height: '56px',
                borderRadius: mainBorderRadius,
                borderTopLeftRadius: mainBorderRadius,
                borderTopRightRadius: mainBorderRadius,
                color: '#000000',
                '&:hover': {
                    backgroundColor: mainBackgroundColor
                },
                '&$focused': {
                    backgroundColor: mainBackgroundColor
                },
                '&$disabled': {
                    backgroundColor: mainBackgroundColor
                },
                //'&$error': {
                //    backgroundColor: mainBackgroundColor
                //}
            },
            multiline: {
                height: 'auto'
            },
            underline: {
                borderBottom: '0',
                '&:before': {
                    borderBottom: '0'
                },
                '&:after': {
                    borderBottom: '0',
                    margin: '0 5px'
                },
                '&:hover:not($disabled):not($focused):not($error):before': {
                    borderBottom: '0'
                },
                '&$disabled:before': {
                    borderBottom: '0'
                },
                '&$error:after': {
                    borderBottom: '1px solid'
                },
            },
            adornedEnd: {
                paddingRight: '0'
            }
        },
        MuiFormLabel: {
            root: {
                '&$error': {
                    color: '#000000'
                },
                '&$error&$focused': {
                    color: mainLightTextColor
                },
                '&$filled': {
                    color: mainLightTextColor
                }
            }
        },
        MuiFormControl: {
            root: {
                margin: '0'
            }
        },
        MuiButton: {
            root: {
                color: mainColor,
                fontWeight: 600
            },
            contained: {

            },
            sizeLarge: {
                padding: '0',
                width: bigElementWidth,
                height: bigElementHeight,
                fontSize: '16px'
            },

            /* Styles applied to the root element if `size="large"`. */
            sizeSmall: {
                padding: '0',
                minWidth: smallElementWidth,
                minHeight: smallElementHeight,
                fontSize: '14px'
            },
        },
        MuiTouchRipple: {
            rippleVisible: {
                opacity: 0.1
            },
            '@keyframes mui-ripple-enter': {
                '0%': {
                    transform: 'scale(0)',
                    opacity: 0.04
                },
                '100%': {
                    transform: 'scale(1)',
                    opacity: 0.1
                }
            },
        }
    },
});