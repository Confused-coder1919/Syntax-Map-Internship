import React, { useState, useEffect } from "react";
import { Tabs, Section, Card, Button, PageLayout, Alert } from "../UI";
import StudentProgressTable from "./StudentProgressTable";
import StudentExampleReview from "./StudentExampleReview";
import { useHistory } from "react-router-dom";
import { API_BASE_URL } from "../../config"; // Adjust the import based on your project structure
import SttudentProgressTable from "./StudentProgressTable";

const PageProfessor = () => {
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pendingReviews, setPendingReviews] = useState([]);
  const history = useHistory();

  useEffect(()=> {
    window.scrollTo(0, 0)
  },[])
  // API base URL
  const token = localStorage.getItem('jstoken');
  useEffect(() => {
    // Check if user is authenticated and has teacher role
    const userRole = parseInt(localStorage.getItem('user_role'));
    if (!userRole || (userRole !== 2 && userRole !== 1)) {
      history.push('/login_register');
      return;
    }

    // Fetch classes and pending reviews
    fetchPendingReviews();
    fetchStudents();
  }, [history]);
  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/students/`, {
        headers: {
          "Authorization": token
        }
      });
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const data = await response.json();
      setStudents(data.students);
      setLoading(false);

    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Failed to fetch classes. Please try again later.");
      setLoading(false);

    }
  };


  const fetchPendingReviews = async () => {
    try {
      // Get examples pending review (student submissions)
      const response = await fetch(`${API_BASE_URL}/teacher/shared-examples?teacher_reviewed=false`, {
        headers: {
          "Authorization": token
        }
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.examples) {
        setPendingReviews(data.examples);
      } else {
        console.warn("No pending reviews or unexpected data format:", data);
        setPendingReviews([]);
      }
    } catch (err) {
      console.error("Error fetching pending reviews:", err);
      // Don't set error state here as it would disrupt the entire page
    }
  };


  const renderDashboard = () => (
    <>
      <Section title="Teacher Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-amber-50">
            <h3 className="text-xl font-semibold text-amber-700">Pending Example</h3>
            <p className="text-3xl font-bold">{pendingReviews?.filter(item => !item.teacher_reviewed).length}</p>
          </Card>
          <Card className="p-4 bg-amber-50">
            <h3 className="text-xl font-semibold text-amber-700">Total students</h3>
            <p className="text-3xl font-bold">{students?.length}</p>
          </Card>
        </div>
      </Section>
      {selectedClassId && (
        <Section title="Student Progress">
          <StudentProgressTable
            students={students}
            classId={selectedClassId}
          />
        </Section>
      )}
    </>
  ); return (
    <PageLayout title="Teacher Dashboard">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading && !activeTab && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      <Tabs
        defaultIndex={["dashboard", "Example", "Progress"].indexOf(activeTab)}
        onChange={(index) => {
          const tabIds = ["dashboard", "Example", "Progress"];
          setActiveTab(tabIds[index]);
        }}
        tabs={[
          {
            name: "Dashboard",
            content: renderDashboard()
          },
          {
            name: "Student Example Reviews",
            content: (
              <StudentExampleReview
                pendingReviews={pendingReviews}
                refreshReviews={() => fetchPendingReviews()}
                students={students}
              />
            )
          },
          {
            name: "Student Progress",
            content: (
              <SttudentProgressTable
              />
            )
          }
        ]}
      />
    </PageLayout>
  );
};

export default PageProfessor;
