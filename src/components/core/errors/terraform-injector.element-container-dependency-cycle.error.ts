import termSize from 'term-size';
import { TerraformInjectorElementContainerClass } from '../../../module';

export class TerraformInjectorElementContainerDependencyCycleError extends Error {
  private static arrows = {
    right: '➤',
    left: '◀',
    up: '▲',
    down: '▼',
  };
  private static chunkString(targetString: string | undefined, size: number) {
    if (!targetString) return [];
    return targetString
      .match(new RegExp('.{1,' + size + '}', 'g'))!
      .map((match) => match.toString());
  }
  constructor(
    cycledContainers: Array<
      TerraformInjectorElementContainerClass<any, any, any>
    >,
  ) {
    const originalMessage = `It seems that ${cycledContainers.length} element are traped in dependency cycle.`;
    const blankLength = 5;
    const maxWidth = termSize().columns - blankLength - 10;
    const arrowBlankLength = 1;
    const arrowRepeat = 2;
    super(
      [
        originalMessage,
        `${TerraformInjectorElementContainerDependencyCycleError.arrows.right} `.repeat(
          blankLength - (blankLength / 2 == 0 ? 0 : 1),
        ),
        ...cycledContainers
          .map((eachContainer) => {
            return [
              ...new Array(arrowRepeat).fill(
                `${' '.repeat(arrowBlankLength)}${
                  TerraformInjectorElementContainerDependencyCycleError.arrows
                    .down
                }`,
              ),
              ...TerraformInjectorElementContainerDependencyCycleError.chunkString(
                eachContainer.name,
                maxWidth,
              ),
              ...TerraformInjectorElementContainerDependencyCycleError.chunkString(
                `Element Type : ${eachContainer.terraformElementClass.name}`,
                maxWidth,
              ),
              ...TerraformInjectorElementContainerDependencyCycleError.chunkString(
                `Scope path : ${eachContainer.scope.node.path}/${eachContainer.id}`,
                maxWidth,
              ),
              ...TerraformInjectorElementContainerDependencyCycleError.chunkString(
                `Create at ${eachContainer.caller}`,
                maxWidth,
              ),
              ...TerraformInjectorElementContainerDependencyCycleError.chunkString(
                eachContainer.description,
                maxWidth,
              ),
              ...new Array(arrowRepeat).fill(
                `${' '.repeat(arrowBlankLength)}${
                  TerraformInjectorElementContainerDependencyCycleError.arrows
                    .down
                }`,
              ),
            ].filter((eachLine) => eachLine);
          })
          .flat()
          .map(
            (eachString) =>
              `${
                TerraformInjectorElementContainerDependencyCycleError.arrows.up
              }${' '.repeat(blankLength)}${eachString}`,
          ),
        `${TerraformInjectorElementContainerDependencyCycleError.arrows.left} `.repeat(
          blankLength - (blankLength / 2 == 0 ? 0 : 1),
        ),
      ].join('\n'),
    );
  }
}
