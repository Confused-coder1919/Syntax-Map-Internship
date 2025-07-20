import { Link } from "react-router-dom";
import styled from "styled-components";

export const LinkMap = styled(Link)`
  > path:hover {
    fill: red;
    fill-opacity: 0.8;
}
`;