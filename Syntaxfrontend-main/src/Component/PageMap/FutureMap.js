import React from "react";
import FutureMapSVG from "../SVGs/FutureMapSVG.js";
import { Link } from "react-router-dom";

class FutureMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hidden: false
        };
    }
      
    handleClickLeft() {
        console.log(this.state.ButtonValue);
    }

    render() {
        return (
            <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                            Future Tenses
                        </h1>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Visual representation of English future expressions
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                        <div className="p-3 md:p-6">
                            <div className="futureMap w-full h-full overflow-auto">
                                <FutureMapSVG />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-center space-x-4">
                        <Link 
                            to="/dashboard" 
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default FutureMap;