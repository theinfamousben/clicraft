import { program } from 'commander';

// Generate shell completions for bash, zsh, and fish
export function generateCompletions(shell) {
    const commands = [
        'search', 'create', 'install', 'uninstall', 'import', 
        'auth', 'launch', 'info', 'upgrade', 'config', 'alias'
    ];

    const loaders = ['fabric', 'forge', 'quilt', 'neoforge'];
    const authActions = ['login', 'logout', 'switch', 'status'];
    const configActions = ['get', 'set', 'list', 'reset'];
    const upgradeKeywords = ['mods', 'loader', 'minecraft', 'config'];

    switch (shell) {
        case 'bash':
            console.log(generateBashCompletions(commands, loaders, authActions, configActions, upgradeKeywords));
            break;
        case 'zsh':
            console.log(generateZshCompletions(commands, loaders, authActions, configActions, upgradeKeywords));
            break;
        case 'fish':
            console.log(generateFishCompletions(commands, loaders, authActions, configActions, upgradeKeywords));
            break;
        default:
            console.log(`Unknown shell: ${shell}`);
            console.log('Supported shells: bash, zsh, fish');
            console.log('\nUsage:');
            console.log('  clicraft completions bash >> ~/.bashrc');
            console.log('  clicraft completions zsh >> ~/.zshrc');
            console.log('  clicraft completions fish > ~/.config/fish/completions/clicraft.fish');
    }
}

function generateBashCompletions(commands, loaders, authActions, configActions, upgradeKeywords) {
    return `# clicraft bash completion
_clicraft() {
    local cur prev words cword
    _init_completion || return

    local commands="${commands.join(' ')}"
    local loaders="${loaders.join(' ')}"
    local auth_actions="${authActions.join(' ')}"
    local config_actions="${configActions.join(' ')}"
    local upgrade_keywords="${upgradeKeywords.join(' ')}"

    case $prev in
        clicraft)
            COMPREPLY=( $(compgen -W "$commands -v --version -h --help" -- "$cur") )
            return
            ;;
        search)
            # No completions for search query
            return
            ;;
        install|uninstall)
            # Complete with mod slugs from config if in instance directory
            if [[ -f mcconfig.json ]]; then
                local mods=$(grep -oP '"slug":\\s*"\\K[^"]+' mcconfig.json 2>/dev/null)
                COMPREPLY=( $(compgen -W "$mods" -- "$cur") )
            fi
            return
            ;;
        upgrade)
            COMPREPLY=( $(compgen -W "$upgrade_keywords" -- "$cur") )
            return
            ;;
        auth)
            COMPREPLY=( $(compgen -W "$auth_actions" -- "$cur") )
            return
            ;;
        config)
            COMPREPLY=( $(compgen -W "$config_actions" -- "$cur") )
            return
            ;;
        --loader)
            COMPREPLY=( $(compgen -W "$loaders" -- "$cur") )
            return
            ;;
        -i|--instance)
            _filedir -d
            return
            ;;
    esac

    case $cur in
        -*)
            case \${words[1]} in
                search)
                    COMPREPLY=( $(compgen -W "-l --limit -m --mc-version --loader -i --instance --any -r --resourcepacks -s --shaders --verbose -h --help" -- "$cur") )
                    ;;
                install)
                    COMPREPLY=( $(compgen -W "-i --instance -f --force --no-deps -r --resourcepacks -s --shaders --verbose -h --help" -- "$cur") )
                    ;;
                uninstall)
                    COMPREPLY=( $(compgen -W "-i --instance -f --force --verbose -h --help" -- "$cur") )
                    ;;
                upgrade)
                    COMPREPLY=( $(compgen -W "-i --instance -f --force -c --check --verbose -h --help" -- "$cur") )
                    ;;
                create)
                    COMPREPLY=( $(compgen -W "-p --path -f --force --verbose -h --help" -- "$cur") )
                    ;;
                launch)
                    COMPREPLY=( $(compgen -W "-i --instance -h --help" -- "$cur") )
                    ;;
                import)
                    COMPREPLY=( $(compgen -W "-i --instance -f --force --verbose -h --help" -- "$cur") )
                    ;;
                *)
                    COMPREPLY=( $(compgen -W "-h --help" -- "$cur") )
                    ;;
            esac
            return
            ;;
    esac
}

complete -F _clicraft clicraft`;
}

function generateZshCompletions(commands, loaders, authActions, configActions, upgradeKeywords) {
    return `#compdef clicraft
# clicraft zsh completion

_clicraft() {
    local -a commands
    commands=(
        'search:Search for Minecraft mods on Modrinth'
        'create:Create a new Minecraft instance'
        'install:Install mods, resource packs, or shaders'
        'uninstall:Uninstall a mod from the instance'
        'import:Import a modpack (.mrpack)'
        'auth:Manage Minecraft accounts'
        'launch:Launch the Minecraft instance'
        'info:Show instance information'
        'upgrade:Upgrade mods, Minecraft version, or mod loader'
        'config:Manage CLIcraft settings'
        'alias:Manage command aliases'
    )

    _arguments -C \\
        '-v[Show the current version]' \\
        '--version[Show the current version]' \\
        '-h[Show help]' \\
        '--help[Show help]' \\
        '1: :->command' \\
        '*:: :->args'

    case $state in
        command)
            _describe 'command' commands
            ;;
        args)
            case $words[1] in
                search)
                    _arguments \\
                        '-l[Number of results]:limit:' \\
                        '--limit[Number of results]:limit:' \\
                        '-m[Minecraft version]:version:' \\
                        '--mc-version[Minecraft version]:version:' \\
                        '--loader[Mod loader]:loader:(fabric forge quilt neoforge)' \\
                        '-i[Instance path]:instance:_files -/' \\
                        '--instance[Instance path]:instance:_files -/' \\
                        '--any[Ignore instance filtering]' \\
                        '-r[Search resource packs]' \\
                        '--resourcepacks[Search resource packs]' \\
                        '-s[Search shaders]' \\
                        '--shaders[Search shaders]' \\
                        '--verbose[Enable verbose output]' \\
                        '*:query:'
                    ;;
                install)
                    _arguments \\
                        '-i[Instance path]:instance:_files -/' \\
                        '--instance[Instance path]:instance:_files -/' \\
                        '-f[Force reinstall]' \\
                        '--force[Force reinstall]' \\
                        '--no-deps[Skip dependencies]' \\
                        '-r[Install as resource packs]' \\
                        '--resourcepacks[Install as resource packs]' \\
                        '-s[Install as shaders]' \\
                        '--shaders[Install as shaders]' \\
                        '--verbose[Enable verbose output]' \\
                        '*:mod slug:'
                    ;;
                uninstall)
                    _arguments \\
                        '-i[Instance path]:instance:_files -/' \\
                        '--instance[Instance path]:instance:_files -/' \\
                        '-f[Skip confirmation]' \\
                        '--force[Skip confirmation]' \\
                        '--verbose[Enable verbose output]' \\
                        '*:mod:'
                    ;;
                upgrade)
                    _arguments \\
                        '-i[Instance path]:instance:_files -/' \\
                        '--instance[Instance path]:instance:_files -/' \\
                        '-f[Force upgrade]' \\
                        '--force[Force upgrade]' \\
                        '-c[Check only]' \\
                        '--check[Check only]' \\
                        '--verbose[Enable verbose output]' \\
                        '*:target:(mods loader minecraft config)'
                    ;;
                import)
                    _arguments \\
                        '-i[Instance path]:instance:_files -/' \\
                        '--instance[Instance path]:instance:_files -/' \\
                        '-f[Overwrite existing]' \\
                        '--force[Overwrite existing]' \\
                        '--verbose[Enable verbose output]' \\
                        '*:packfile:_files -g "*.mrpack"'
                    ;;
                auth)
                    _arguments \\
                        '-f[Skip confirmation]' \\
                        '--force[Skip confirmation]' \\
                        '1:action:(login logout switch status)'
                    ;;
                config)
                    _arguments \\
                        '1:action:(get set list reset)' \\
                        '*:args:'
                    ;;
            esac
            ;;
    esac
}

_clicraft "$@"`;
}

function generateFishCompletions(commands, loaders, authActions, configActions, upgradeKeywords) {
    return `# clicraft fish completion

# Disable file completion by default
complete -c clicraft -f

# Commands
complete -c clicraft -n '__fish_use_subcommand' -a 'search' -d 'Search for Minecraft mods on Modrinth'
complete -c clicraft -n '__fish_use_subcommand' -a 'create' -d 'Create a new Minecraft instance'
complete -c clicraft -n '__fish_use_subcommand' -a 'install' -d 'Install mods, resource packs, or shaders'
complete -c clicraft -n '__fish_use_subcommand' -a 'uninstall' -d 'Uninstall a mod from the instance'
complete -c clicraft -n '__fish_use_subcommand' -a 'import' -d 'Import a modpack (.mrpack)'
complete -c clicraft -n '__fish_use_subcommand' -a 'auth' -d 'Manage Minecraft accounts'
complete -c clicraft -n '__fish_use_subcommand' -a 'launch' -d 'Launch the Minecraft instance'
complete -c clicraft -n '__fish_use_subcommand' -a 'info' -d 'Show instance information'
complete -c clicraft -n '__fish_use_subcommand' -a 'upgrade' -d 'Upgrade mods, Minecraft, or loader'
complete -c clicraft -n '__fish_use_subcommand' -a 'config' -d 'Manage CLIcraft settings'
complete -c clicraft -n '__fish_use_subcommand' -a 'alias' -d 'Manage command aliases'

# Global options
complete -c clicraft -s v -l version -d 'Show the current version'
complete -c clicraft -s h -l help -d 'Show help'

# search options
complete -c clicraft -n '__fish_seen_subcommand_from search' -s l -l limit -d 'Number of results'
complete -c clicraft -n '__fish_seen_subcommand_from search' -s m -l mc-version -d 'Minecraft version'
complete -c clicraft -n '__fish_seen_subcommand_from search' -l loader -a '${loaders.join(' ')}' -d 'Mod loader'
complete -c clicraft -n '__fish_seen_subcommand_from search' -s i -l instance -ra '(__fish_complete_directories)' -d 'Instance path'
complete -c clicraft -n '__fish_seen_subcommand_from search' -l any -d 'Ignore instance filtering'
complete -c clicraft -n '__fish_seen_subcommand_from search' -s r -l resourcepacks -d 'Search resource packs'
complete -c clicraft -n '__fish_seen_subcommand_from search' -s s -l shaders -d 'Search shaders'
complete -c clicraft -n '__fish_seen_subcommand_from search' -l verbose -d 'Enable verbose output'

# install options
complete -c clicraft -n '__fish_seen_subcommand_from install' -s i -l instance -ra '(__fish_complete_directories)' -d 'Instance path'
complete -c clicraft -n '__fish_seen_subcommand_from install' -s f -l force -d 'Force reinstall'
complete -c clicraft -n '__fish_seen_subcommand_from install' -l no-deps -d 'Skip dependencies'
complete -c clicraft -n '__fish_seen_subcommand_from install' -s r -l resourcepacks -d 'Install as resource packs'
complete -c clicraft -n '__fish_seen_subcommand_from install' -s s -l shaders -d 'Install as shaders'
complete -c clicraft -n '__fish_seen_subcommand_from install' -l verbose -d 'Enable verbose output'

# uninstall options
complete -c clicraft -n '__fish_seen_subcommand_from uninstall' -s i -l instance -ra '(__fish_complete_directories)' -d 'Instance path'
complete -c clicraft -n '__fish_seen_subcommand_from uninstall' -s f -l force -d 'Skip confirmation'
complete -c clicraft -n '__fish_seen_subcommand_from uninstall' -l verbose -d 'Enable verbose output'

# upgrade options
complete -c clicraft -n '__fish_seen_subcommand_from upgrade' -s i -l instance -ra '(__fish_complete_directories)' -d 'Instance path'
complete -c clicraft -n '__fish_seen_subcommand_from upgrade' -s f -l force -d 'Force upgrade'
complete -c clicraft -n '__fish_seen_subcommand_from upgrade' -s c -l check -d 'Check only'
complete -c clicraft -n '__fish_seen_subcommand_from upgrade' -l verbose -d 'Enable verbose output'
complete -c clicraft -n '__fish_seen_subcommand_from upgrade' -a '${upgradeKeywords.join(' ')}' -d 'Upgrade target'

# import options
complete -c clicraft -n '__fish_seen_subcommand_from import' -s i -l instance -ra '(__fish_complete_directories)' -d 'Instance path'
complete -c clicraft -n '__fish_seen_subcommand_from import' -s f -l force -d 'Overwrite existing'
complete -c clicraft -n '__fish_seen_subcommand_from import' -l verbose -d 'Enable verbose output'
complete -c clicraft -n '__fish_seen_subcommand_from import' -ra '(__fish_complete_suffix .mrpack)' -d 'Modpack file'

# auth subcommands
complete -c clicraft -n '__fish_seen_subcommand_from auth' -a '${authActions.join(' ')}'

# config subcommands  
complete -c clicraft -n '__fish_seen_subcommand_from config' -a '${configActions.join(' ')}'

# create options
complete -c clicraft -n '__fish_seen_subcommand_from create' -s p -l path -ra '(__fish_complete_directories)' -d 'Instance path'
complete -c clicraft -n '__fish_seen_subcommand_from create' -s f -l force -d 'Overwrite existing'
complete -c clicraft -n '__fish_seen_subcommand_from create' -l verbose -d 'Enable verbose output'

# launch options
complete -c clicraft -n '__fish_seen_subcommand_from launch' -s i -l instance -ra '(__fish_complete_directories)' -d 'Instance path'`;
}

export default { generateCompletions };
