module.exports.tableNames = {
    department: "department",
    student: "student",
    section: "section",
    instructor: "instructor"
};

module.exports.deptColumns = {
    deptName: "deptName",
    building: "building",
    budget: "budget"
};

module.exports.instructorColumns = {
    id: "id",
    name: "name",
    salary: "salary",
    department_name: "department_id"
};

module.exports.studentColumns = {
    id: "id",
    name: "name",
    total_credits: "total_credits",
    instructor_id: "instructor_id",
    department_name: "department_name"
};