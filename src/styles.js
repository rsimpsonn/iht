import styled from "styled-components";

export const Header = styled.p`
  font-size: 22px;
  font-family: Lato;
  font-weight: Bold;
  margin: 20px 0 0;
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
`;
