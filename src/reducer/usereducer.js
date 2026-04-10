// Utility function to get the initial state from localStorage
const getInitialState = () => {
  return {
    bankAccountAdded: JSON.parse(localStorage.getItem('bankAccountAdded')) || false,
    bankAccountAdded1: JSON.parse(localStorage.getItem('bankAccountAdded1')) || false,
  };
};

export const initialState = getInitialState();

export const reducer = (state, action) => {
  let newState;
  switch (action.type) {
    case 'Bank_Account_Added':
      newState = {
        ...state,
        bankAccountAdded: action.payload,
      };
      localStorage.setItem('bankAccountAdded', JSON.stringify(newState.bankAccountAdded));
      return newState;
    case 'Bank_Account_Added1':
      newState = {
        ...state,
        bankAccountAdded1: action.payload,
      };
      localStorage.setItem('bankAccountAdded1', JSON.stringify(newState.bankAccountAdded1));
      return newState;
    default:
      return state;
  }
};
