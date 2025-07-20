import sys

def main(args):
    if len(args) < 2:
        return 84
    i = 1
    while i < len(args):
        content = ""
        #read file
        with open(args[i]) as f:
            content = f.read()
        #add break
        content = content.replace('><', '>\n<')
        content = content.replace('clip-rule', 'clipRule')
        content = content.replace('stroke-linecap', 'strokeLinecap')
        content = content.replace('stroke-miterlimit', 'strokeMiterlimit')
        content = content.replace('xmlns:xlink', 'xmlnsXlink')
        content = content.replace('fill-rule', 'fillRule')
        content = content.replace('fill-opacity', 'fillOpacity')
        content = content.replace('stroke-width', 'strokeWidth')
        content = content.replace('stroke-linejoin', 'strokeLinejoin')
        content = content.replace('clip-path', 'clipPath')
        content = content.replace('xlink:href', 'xlinkHref')
        #write file
        f = open(args[i], "w")
        f.write(content)
        f.close()
        i = i + 1
    return 0

if __name__ == "__main__":
    main(sys.argv)