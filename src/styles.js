import styled from "styled-components";

export const Header = styled.p`
  font-size: 22px;
  font-family: Lato;
  font-weight: Bold;
  margin: 20px 0 0;

  ${props =>
    props.margin &&
    `
  margin: 20px 20px 20px 0;
  `}

  ${props =>
    props.color &&
    `
  color: ${props.color}`}
`;

export const SubHeader = styled.p`
  font-size: 16px;
  font-family: Lato;
  font-weight: Bold;
  margin: 0;

  ${props =>
    props.margin &&
    `
  margin: 20px 10px 10px 0;
  `}

  ${props =>
    props.color &&
    `
  color: ${props.color}`}
`;

export const Small = styled.p`
  font-size: 14px;
  font-family: Lato;
  color: #595959;
  margin: 0;

  ${props =>
    props.margin &&
    `
  margin: 10px 10px 10px 0;
  `}

  ${props =>
    props.color &&
    `
  color: ${props.color}`}

  ${props =>
    props.bold &&
    `
  font-weight: Bold`}

  ${props =>
    props.cursor &&
    `
  cursor: pointer`}
`;

export const Tiny = styled.p`
  font-size: 13px;
  font-family: Lato;
  color: #5a5a5a;
  margin: 0;

  ${props =>
    props.margin &&
    `
  margin: 10px 10px 10px 0;
  `}

  ${props =>
    props.color &&
    `
  color: ${props.color}`}

  ${props =>
    props.bold &&
    `
  font-weight: Bold`}

  ${props =>
    props.cursor &&
    `
  cursor: pointer`}
`;

export const SmallButton = styled.button`
  background-color: #09aa82;
  border-radius: 20px;
  padding: 8px 10px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  margin: auto;
  border-width: 0px;
  width: 100%;

  &:focus {
    outline: none;
  }

  ${props =>
    props.color &&
    `
    background-color: ${props.color}`}
`;

export const ButtonText = styled.p`
  font-family: Lato;
  font-weight: Bold;
  color: white;
  font-size: 15px;
`;

export const NiceInput = styled.input`
  border-radius: 4px;
  background-color: #e9e9e9;
  padding: 5px 10px;
  font-size: 16px;
  width: 100px;
  border: none;
  font-family: Lato;
  font-weight: Bold;
  &:focus {
    outline: none;
  }

  ${props =>
    props.long &&
    `
    width: 120px;
    `}
`;

export const NiceArea = styled.textarea`
  border-radius: 4px;
  background-color: #e9e9e9;
  padding: 5px 10px;
  font-size: 16px;
  border: none;
  font-family: Lato;
  font-weight: Bold;
  resize: none;
  &:focus {
    outline: none;
  }

  ${props =>
    props.long &&
    `
    width: 120px;
    `}
`;
