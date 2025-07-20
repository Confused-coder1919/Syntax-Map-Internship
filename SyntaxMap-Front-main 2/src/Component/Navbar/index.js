import React from "react";
import {
    Nav,
    NavLogo,
    NavLink,
    Bars,
    NavMenu,
    NavMenuDropDown,
    NavDropDownContent,
} from "./NavbarElements";
import logo from "../../img/LC-1.jpg"

class Navbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
      }

      /*
        <NavBtn>
            <NavBtnLink to="/sign-up">Sign Up</NavBtnLink>                
        </NavBtn>
      */

  render() {
    return (
      <div style={{marginBottom:"5%"}}>
      <Nav>
        <NavLogo to="/">
            <img src={logo} style={{ height: "auto", maxWidth: "100%" , verticalAlign: "middle"}}/>
        </NavLogo>
        <Bars />

        <NavMenu>
            <NavLink to="/">
                Home
            </NavLink>
            <NavLink to="/tensemap">
                Tenses Map
            </NavLink>
            <NavLink to="/login_register">
                Log in / Register
            </NavLink>
            <NavMenuDropDown>
                Admin
                <NavDropDownContent>
                    <NavLink to="/addquestion">
                        Add Question
                    </NavLink>
                    <NavLink to="/admincourse">
                        Admin course
                    </NavLink>
                </NavDropDownContent>
            </NavMenuDropDown>
            <NavLink to="/notepad">
                Notepad
            </NavLink>
            <NavLink to="/multiplayer">
                Multiplayer
            </NavLink>
        </NavMenu> 
        </Nav>
      </div>
    );
  }
}

export default Navbar;