// 使用高阶函数并没有把包减小
// const ExampleHoc = (WrappedComponent) => {
//     return class extends React.Component {
//         constructor(props) {
//             super(props);
//         }
//         render() {
//             return <WrappedComponent {...this.props} />;
//         }
//     };
// };
//
// export default ExampleHoc(component);